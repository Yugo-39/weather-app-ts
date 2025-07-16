import './style.css';

const API_KEY = import.meta.env.VITE_WEATHER_API_KEY;

// 型定義
interface ForecastHour {
  time: string;
  temp_c: number;
  condition: {
    text: string;
    icon: string;
  };
}

interface ForecastDay {
  date: string;
  day: {
    avgtemp_c: number;
    condition: {
      text: string;
      icon: string;
    };
  };
  hour: ForecastHour[];
}

let forecastData: ForecastDay[] = [];

// ==============================
// 背景画像を天気に応じて変更する関数
// ==============================
function setBackgroundByCondition(condition: string) {
  const body = document.body;
  let image = '';

  if (condition.includes('晴')) {
    image = '/images/sunny.jpg';
  } else if (condition.includes('曇')) {
    image = '/images/cloudy.jpg';
  } else if (condition.includes('雨')) {
    image = '/images/rainy.jpg';
  } else if (condition.includes('雪')) {
    image = '/images/snow.jpg';
  } else {
    body.style.backgroundColor = '#f5f6fa';
    body.style.backgroundImage = '';
    return;
  }

  body.style.backgroundImage = `url("${image}")`;
  body.style.backgroundSize = 'cover';
  body.style.backgroundPosition = 'center';
  body.style.backgroundRepeat = 'no-repeat';
}

// ==============================
// 天気を取得するボタンクリック時の処理
// ==============================
document.getElementById('btn')?.addEventListener('click', async () => {
  const inputElement = document.getElementById('cityInput');
  if (!(inputElement instanceof HTMLInputElement)) return;

  const city = inputElement.value.trim();
  if (!city) {
    alert('都市を入力してください');
    return;
  }

  try {
    const response = await fetch(
      `https://api.weatherapi.com/v1/forecast.json?key=${API_KEY}&q=${city}&days=3&lang=ja`
    );
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error?.message || 'エラーが発生しました');
    }

    forecastData = data.forecast.forecastday;
    renderForecastDay(0);
    activateTabs();
  } catch (error: any) {
    const info = document.getElementById('info');
    if (info) info.innerHTML = `<p>エラー: ${error.message}</p>`;
    console.error(error);
  }
});

// ==============================
// 指定日の天気を表示する関数（0:今日, 1:明日, 2:明後日）
// ==============================
function renderForecastDay(dayIndex: number) {
  const info = document.getElementById('info');
  if (!info) return;

  const day = forecastData[dayIndex];

  let html = `
    <h2>${day.date} の天気</h2>
    <p>平均気温：${day.day.avgtemp_c}°C</p>
    <p>天気：${day.day.condition.text}</p>
    <img src="${day.day.condition.icon}" alt="天気アイコン" />
    <h3>時間ごとの天気</h3>
    <div class="hourly-scroll">
  `;

  day.hour.forEach((h) => {
    const time = h.time.split(' ')[1];
    html += `
      <div class="hour-card">
        <p class="hour">${time}</p>
        <img src="${h.condition.icon}" alt="${h.condition.text}" />
        <p>${h.temp_c}°C</p>
      </div>
    `;
  });

  html += `</div>`;
  info.innerHTML = html;

  setBackgroundByCondition(day.day.condition.text);
}

// ==============================
// タブ（今日・明日・明後日）の切り替え機能
// ==============================
function activateTabs() {
  const tabs = document.querySelectorAll('.tab');

  tabs.forEach((tab) => {
    tab.addEventListener('click', () => {
      tabs.forEach((t) => t.classList.remove('active'));
      tab.classList.add('active');

      const dayIndex = parseInt(tab.getAttribute('data-day') || '0', 10);
      renderForecastDay(dayIndex);
    });
  });
}
