// 全角、半角の変換などを簡単に行えるパッケージ
import moji from 'moji';
import type { NextApiRequest, NextApiResponse } from 'next';

// ソート用の比較関数 title順にする
const compare = (a: BookData, b: BookData) => {
  if (a.title < b.title) {
    return -1
  } else {
    return 1
  }
}

type RakutenItem = {
  Item: BookItem;
}

type BookItem = {
  title: string;
  author: string;
  publisherName: string;
  largeImageUrl: string;
  isbn: string;
}

export type BookData = {
  title: string;
  author: string;
  publisherName: string;
  imageUrl: string;
  isbn: string;
}

// UTF-8にエンコードする関数
const convertToUtf8 = (text: string): string => {
  return unescape(encodeURIComponent(text))
}

// 必要なデータを抽出する関数
// 取ってきたデータのtitleとauthorをフォーマットする
const extractData = (item: RakutenItem) => {
  let titleString = item.Item.title;
  // パッケージmojiを使用して、表記揺れを防ぐ
  // ZE→HE：全角英数字を半角英数字に変換
  titleString = moji(titleString).convert('ZE', 'HE').toString();
  // ZS→HS：全角スペースを半角スペースに変換
  titleString = moji(titleString).convert('ZS', 'HS').toString();

  let authorString = item.Item.author;
  authorString = moji(authorString).convert('ZE', 'HE').toString();
  // 全角スペースを半角スペースに変換して、スペースを排除
  // reject("排除したい文字種")で排除できる
  authorString = moji(authorString).convert('ZS', 'HS').reject('HS').toString();

  const data: BookData = {
    title: titleString,
    author: authorString,
    publisherName: item.Item.publisherName,
    imageUrl: item.Item.largeImageUrl,
    isbn: item.Item.isbn
  }

  return data;
}

const Rakuten = async (req: NextApiRequest, res: NextApiResponse) => {
  let url = "https://app.rakuten.co.jp/services/api/BooksBook/Search/20170404?applicationId=" +
    process.env.RAKUTEN_APP_ID +
    "&booksGenreId=001001";

  // クエリパラメータからtitleを取得
  let { title } = req.query;
  if (title) {
    title = title.toString();
    url += "&title=" + convertToUtf8(title);
  }

  // クエリパラメータからauthorを取得
  let { author } = req.query;
  if (author) {
    author = author.toString();
    title += "&author=" + convertToUtf8(author);
  }

  if (title || author) {
    let bookList: BookData[] = [];
    let count = -1;
    const response = await fetch(url);
    const data = await response.json();
    if (data) {
      data.Items.map((item: RakutenItem) => {
        bookList = [...bookList, extractData(item)];
      });
      count = data.count;
    }

    // 残りのページのデータを取得
    // 一度のレスポンスごとに30冊分のデータしか取ってこれないため
    for (let i = 1; i < data.pageCount; i++) {
      // 連続でリクエストをかけるとAPIへのアクセスを遮断されてしまうため、リクエストごとに0.3秒待つ
      await new Promise((resolve) => setTimeout(resolve, 300));
      const response = await fetch(url + "&page=" + (i + 1));
      const data = await response.json();
      if (data) {
        data.Items.map((item: RakutenItem) => {
          bookList = [...bookList, extractData(item)];
        })
      }
    }
    // レスポンスを定義
    if (count !== bookList.length) {
      res.status(500).json({ message: "Error: Rakuten Book API" });
    } else {
      // 成功時は配列をソートして返す
      bookList.sort(compare);
      res.status(200).json({ data: bookList, size: count });
    }
  } else {
    res.status(500).json({ message: "Error: Please set title or author to query." });
  }
}

export default Rakuten;