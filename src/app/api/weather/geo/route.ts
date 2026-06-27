import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const lat = searchParams.get('lat');
  const lon = searchParams.get('lon');
  
  if (!lat || !lon) {
    return NextResponse.json(
      { error: '缺少经纬度参数' },
      { status: 400 }
    );
  }
  
  try {
    // 使用和风天气API的地理位置查询服务
    const apiKey = process.env.QWEATHER_API_KEY;
    if (!apiKey) {
      console.error('未配置和风天气API密钥');
      return NextResponse.json(
        { error: '服务器配置错误：未配置和风天气API密钥' },
        { status: 500 }
      );
    }
    
    console.error(`开始请求地理位置查询API...`);
    const response = await fetch(
      `https://geoapi.qweather.com/v2/city/lookup?location=${lon},${lat}&key=${apiKey}`
    );
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('地理位置API请求失败:', response.status, errorText);
      throw new Error(`地理位置API请求失败: ${response.status} ${errorText}`);
    }
    
    const data = await response.json();
    console.error('地理位置API响应:', JSON.stringify(data).substring(0, 200) + '...');
    
    if (data.code !== '200' || !data.location || data.location.length === 0) {
      console.error('地理位置API响应异常:', JSON.stringify(data));
      return NextResponse.json(
        { location: '未知位置', error: '位置解析失败' },
        { status: 200 }
      );
    }
    
    // 返回城市名称
    const result = { location: data.location[0].name };
    console.error('地理位置解析完成:', result);
    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.error('地理位置解析失败:', error instanceof Error ? error.message : String(error));
    return NextResponse.json(
      { error: '地理位置解析失败', location: '未知位置', message: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}