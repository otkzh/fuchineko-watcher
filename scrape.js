const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');
const path = require('path');

const url = 'https://c-united.co.jp/veloce/campaign/2024/fuchineko/stock/'; // 実際のURLに置き換えてください

async function scrapeAndSaveToCSV() {
  try {
    const response = await axios.get(url);
    const html = response.data;
    const $ = cheerio.load(html);

    const sections = $('.p-home__section02-wrap');
    const data = [['Prefecture', 'Store Name', 'Stock Status', 'Details URL']];

    sections.each(function() {
      const prefectureName = $(this).find('h2').text();
      $(this).find('tbody tr').each(function() {
        let storeName = $(this).find('td').eq(0).text().trim();
        let stockStatusImg = $(this).find('td').eq(1).find('img').attr('src');
        let stockStatus;

        // stockStatusの変換
        if (stockStatusImg.includes('icon02.svg')) {
          stockStatus = '◯';
        } else if (stockStatusImg.includes('icon03.svg')) {
          stockStatus = '△';
        } else if (stockStatusImg.includes('icon04.svg')) {
          stockStatus = '✗';
        } else {
          stockStatus = '';
        }

        const detailsUrl = $(this).find('td').eq(2).find('a').attr('href');
        data.push([prefectureName, storeName, stockStatus, detailsUrl]);
      });
    });

    const csvContent = data.map(row => row.join(',')).join('\n');
    fs.writeFileSync(path.join(__dirname, 'data.csv'), csvContent, 'utf8');
    console.log('CSV file has been saved.');
  } catch (error) {
    console.error('Error:', error);
  }
}

scrapeAndSaveToCSV();
