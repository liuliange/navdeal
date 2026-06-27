import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const city = searchParams.get('city');
  const lat = searchParams.get('lat');
  const lon = searchParams.get('lon');
  
  // 检查是否提供了坐标或城市名
  if (!city && (!lat || !lon)) {
    return NextResponse.json(
      { error: '缺少位置参数（需要提供city或lat+lon）' },
      { status: 400 }
    );
  }
  
  try {
    // 使用和风天气API获取天气数据
    const apiKey = process.env.QWEATHER_API_KEY;
    if (!apiKey) {
      console.error('未配置和风天气API密钥');
      return NextResponse.json(
        { error: '服务器配置错误：未配置和风天气API密钥' },
        { status: 500 }
      );
    }
    
    // 确定位置参数
    let locationParam;
    if (lat && lon) {
      locationParam = `${lon},${lat}`;
      console.error(`使用经纬度查询: ${locationParam}`);
    } else {
      locationParam = city;
      console.error(`使用城市名查询: ${locationParam}`);
    }
    
    // 获取城市ID
    console.error(`开始请求城市查询API...`);
    const locationResponse = await fetch(
      `https://geoapi.qweather.com/v2/city/lookup?location=${encodeURIComponent(locationParam || '')}&key=${apiKey}`
    );
    
    if (!locationResponse.ok) {
      const errorText = await locationResponse.text();
      console.error('城市查询请求失败:', locationResponse.status, errorText);
      throw new Error(`城市查询请求失败: ${locationResponse.status} ${errorText}`);
    }
    
    const locationData = await locationResponse.json();
    console.error('城市查询响应:', JSON.stringify(locationData).substring(0, 200) + '...');
    
    if (locationData.code !== '200' || !locationData.location || locationData.location.length === 0) {
      console.error('城市查询响应异常:', JSON.stringify(locationData));
      return NextResponse.json(
        { error: '找不到该位置', detail: locationData },
        { status: 404 }
      );
    }
    
    const locationId = locationData.location[0].id;
    const cityName = locationData.location[0].name;
    
    console.error(`找到位置: ${cityName}, ID: ${locationId}`);
    
    // 获取实时天气
    console.error(`开始请求实时天气数据...`);
    const weatherResponse = await fetch(
      `https://devapi.qweather.com/v7/weather/now?location=${locationId}&key=${apiKey}`
    );
    
    if (!weatherResponse.ok) {
      const errorText = await weatherResponse.text();
      console.error('天气数据请求失败:', weatherResponse.status, errorText);
      throw new Error(`天气数据请求失败: ${weatherResponse.status} ${errorText}`);
    }
    
    const weatherData = await weatherResponse.json();
    console.error('天气数据响应:', JSON.stringify(weatherData).substring(0, 200) + '...');
    
    if (weatherData.code !== '200') {
      console.error('天气数据响应异常:', JSON.stringify(weatherData));
      return NextResponse.json(
        { error: '天气数据获取失败', detail: weatherData },
        { status: 500 }
      );
    }
    
    // 获取今日天气预报（最高温和最低温）
    console.error(`开始请求天气预报数据...`);
    const forecastResponse = await fetch(
      `https://devapi.qweather.com/v7/weather/3d?location=${locationId}&key=${apiKey}`
    );
    
    if (!forecastResponse.ok) {
      const errorText = await forecastResponse.text();
      console.error('天气预报请求失败:', forecastResponse.status, errorText);
      throw new Error(`天气预报请求失败: ${forecastResponse.status} ${errorText}`);
    }
    
    const forecastData = await forecastResponse.json();
    console.error('天气预报响应:', JSON.stringify(forecastData).substring(0, 200) + '...');
    
    let tempMin = null;
    let tempMax = null;
    
    if (forecastData.code === '200' && forecastData.daily && forecastData.daily.length > 0) {
      const minTemp = Number(forecastData.daily[0].tempMin);
      const maxTemp = Number(forecastData.daily[0].tempMax);
      tempMin = isNaN(minTemp) ? null : minTemp;
      tempMax = isNaN(maxTemp) ? null : maxTemp;
    } else {
      console.error('天气预报响应异常或为空:', JSON.stringify(forecastData));
    }
    
    // 返回处理后的天气数据
    const result = {
      location: cityName,
      temp: isNaN(Number(weatherData.now.temp)) ? null : Number(weatherData.now.temp),
      text: weatherData.now.text || '未知',
      icon: weatherData.now.icon || '999',
      tempMin,
      tempMax
    };
    
    console.error(`天气数据处理完成:`, result);
    return NextResponse.json(result);
  } catch (error) {
    // 详细记录错误信息
    console.error('获取天气数据失败:', error instanceof Error ? error.message : String(error));
    return NextResponse.json(
      { error: '获取天气数据失败', message: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}