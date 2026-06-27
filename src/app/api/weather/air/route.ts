import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const lat = searchParams.get('lat');
  const lon = searchParams.get('lon');
  const location = searchParams.get('location'); // 接收城市参数
  
  // 检查是否提供了必要的参数（经纬度或城市名）
  if ((!lat || !lon) && !location) {
    return NextResponse.json(
      { error: '缺少位置参数（需要提供lat和lon，或者location）' },
      { status: 400 }
    );
  }
  
  try {
    // 使用和风天气API获取空气质量数据
    const apiKey = process.env.QWEATHER_API_KEY;
    if (!apiKey) {
      console.error('未配置和风天气API密钥');
      return NextResponse.json(
        { error: '服务器配置错误' },
        { status: 500 }
      );
    }
    
    let apiUrl;
    let locationType = '';
    
    // 修改：优先使用经纬度，仅当经纬度不完整时才使用城市名
    if (lat && lon) {
      // 使用经纬度格式：经度,纬度
      apiUrl = `https://devapi.qweather.com/v7/air/now?location=${lon},${lat}&key=${apiKey}`;
      locationType = '经纬度';
    } else if (location) {
      // 对于城市名，我们使用location参数
      // 首先尝试使用城市搜索API获取城市ID
      try {
        // 使用和风天气城市搜索API获取城市ID
        const geoApiUrl = `https://geoapi.qweather.com/v2/city/lookup?location=${encodeURIComponent(location)}&key=${apiKey}`;
        console.error(`使用城市名查询: ${location}`);
        console.error(`开始请求城市查询API...`);
        
        const geoResponse = await fetch(geoApiUrl);
        
        if (geoResponse.ok) {
          const geoData = await geoResponse.json();
          console.error('城市查询响应:', JSON.stringify(geoData).substring(0, 200) + '...');
          
          // 检查是否成功获取城市信息
          if (geoData.code === '200' && geoData.location && geoData.location.length > 0) {
            // 使用第一个匹配结果的ID
            const cityId = geoData.location[0].id;
            const cityName = geoData.location[0].name;
            
            console.error(`找到位置: ${cityName}, ID: ${cityId}`);
            
            // 使用获取到的城市ID查询空气质量
            apiUrl = `https://devapi.qweather.com/v7/air/now?location=${cityId}&key=${apiKey}`;
            locationType = '城市ID(动态查询)';
            
            // 继续处理
          } else {
            console.error(`城市搜索失败: ${location}, 错误码: ${geoData.code}`);
            // 城市搜索失败，返回错误信息
            return NextResponse.json(
              { error: `找不到城市: ${location}` },
              { status: 404 }
            );
          }
        } else {
          console.error(`城市搜索请求失败: ${geoResponse.status}`);
          // 区分404错误（城市不存在）和其他错误（服务异常）
          if (geoResponse.status === 404) {
            return NextResponse.json(
              { error: `找不到城市: ${location}` },
              { status: 404 }
            );
          } else {
            // 城市搜索API请求失败，返回错误信息
            return NextResponse.json(
              { error: `城市搜索服务异常，请稍后再试` },
              { status: 503 }
            );
          }
        }
      } catch (error) {
        console.error(`城市搜索异常: ${error instanceof Error ? error.message : String(error)}`);
        // 区分网络错误和其他类型的异常
        if (error instanceof TypeError && error.message.includes('fetch')) {
          return NextResponse.json(
            { error: `网络连接异常，无法访问天气服务` },
            { status: 503 }
          );
        } else {
          // 其他类型的异常
          return NextResponse.json(
            { error: `城市搜索服务异常，请稍后再试` },
            { status: 500 }
          );
        }
      }
      
      // 直接使用城市名称作为参数
    } else {
      // 这种情况应该不会发生，因为前面已经检查过参数
      return NextResponse.json(
        { error: '缺少位置参数' },
        { status: 400 }
      );
    }
    
    console.error(`使用${locationType}请求空气质量数据: ${apiUrl.replace(apiKey, 'API_KEY')}`);
    
    const airResponse = await fetch(apiUrl);
    
    if (!airResponse.ok) {
      const errorText = await airResponse.text();
      console.error('空气质量数据请求失败:', airResponse.status, errorText);
      throw new Error(`空气质量数据请求失败: ${airResponse.status} ${errorText}`);
    }
    
    const airData = await airResponse.json();
    console.error('空气质量数据响应:', JSON.stringify(airData).substring(0, 200) + '...');
    
    // 检查接口返回状态码
    if (airData.code && airData.code !== '200') {
      console.error('空气质量API返回错误:', airData.code, airData.message || '未知错误');
      return NextResponse.json(
        { error: `空气质量数据获取失败: ${airData.message || '服务异常'}` },
        { status: 500 }
      );
    }
    
    // v7版本的API响应格式与v1不同，需要适配
    if (airData.now) {
      // 处理v7版本API响应
      const airNow = airData.now;
      const result = {
        aqi: parseInt(airNow.aqi),
        aqiDisplay: airNow.aqi,
        level: airNow.level,
        category: airNow.category,
        // 生成适当的颜色
        color: getColorByAqi(parseInt(airNow.aqi)),
        primaryPollutant: {
          code: airNow.primary,
          name: getPollutantName(airNow.primary),
          fullName: getPollutantFullName(airNow.primary)
        }
      };
      
      console.error(`空气质量数据处理完成 (v7 API):`, result);
      return NextResponse.json(result);
    }
    
    // 处理v1版本API响应
    if (!airData.indexes || airData.indexes.length === 0) {
      console.error('空气质量数据响应异常:', JSON.stringify(airData));
      return NextResponse.json(
        { error: '空气质量数据获取失败', detail: airData },
        { status: 500 }
      );
    }
    
    // 优先使用US-EPA标准，如果没有则使用QAQI
    const usEpaIndex = airData.indexes.find((index: { code: string }) => index.code === 'us-epa');
    const qaqiIndex = airData.indexes.find((index: { code: string }) => index.code === 'qaqi');
    
    // 使用找到的第一个指数，优先US-EPA
    const aqiIndex = usEpaIndex || qaqiIndex || airData.indexes[0];
    
    // 返回处理后的空气质量数据
    const result = {
      aqi: aqiIndex.aqi,
      aqiDisplay: aqiIndex.aqiDisplay,
      level: aqiIndex.level,
      category: aqiIndex.category,
      color: aqiIndex.color,
      primaryPollutant: aqiIndex.primaryPollutant
    };
    
    console.error(`空气质量数据处理完成 (v1 API):`, result);
    return NextResponse.json(result);
  } catch (error) {
    // 详细记录错误信息
    console.error('获取空气质量数据失败:', error instanceof Error ? error.message : String(error));
    return NextResponse.json(
      { error: '获取空气质量数据失败', message: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}

// 根据AQI值获取颜色
function getColorByAqi(aqi: number) {
  if (aqi <= 50) {
    return { red: 0, green: 228, blue: 0, alpha: 1 }; // 绿色
  } else if (aqi <= 100) {
    return { red: 255, green: 255, blue: 0, alpha: 1 }; // 黄色
  } else if (aqi <= 150) {
    return { red: 255, green: 126, blue: 0, alpha: 1 }; // 橙色
  } else if (aqi <= 200) {
    return { red: 255, green: 0, blue: 0, alpha: 1 }; // 红色
  } else if (aqi <= 300) {
    return { red: 153, green: 0, blue: 76, alpha: 1 }; // 紫色
  } else {
    return { red: 126, green: 0, blue: 35, alpha: 1 }; // 褐红色
  }
}

// 获取污染物名称
function getPollutantName(code: string) {
  const pollutantMap: Record<string, string> = {
    'pm2.5': 'PM2.5',
    'pm25': 'PM2.5',
    'pm10': 'PM10',
    'no2': 'NO₂',
    'so2': 'SO₂',
    'o3': 'O₃',
    'co': 'CO',
    'NA': 'NA'
  };
  
  return pollutantMap[code?.toLowerCase()] || code || 'NA';
}

// 获取污染物全称
function getPollutantFullName(code: string) {
  const pollutantFullNameMap: Record<string, string> = {
    'pm2.5': '细颗粒物',
    'pm25': '细颗粒物',
    'pm10': '可吸入颗粒物',
    'no2': '二氧化氮',
    'so2': '二氧化硫',
    'o3': '臭氧',
    'co': '一氧化碳',
    'NA': ''
  };
  
  return pollutantFullNameMap[code?.toLowerCase()] || '';
}