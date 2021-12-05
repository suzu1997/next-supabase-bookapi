import { VFC } from 'react';
import Link from 'next/link';
import Image from 'next/image';

import noImage from 'public/no_image.png';
import { AddTitle } from './AddTitle';

export type Title = {
  id: number;
  user_id: string;
  title: string;
  author: string;
  image_url: string;
};

type TitlesProps = {
  titles: Title[];
  uuid: string;
  getTitleList: VoidFunction;
  filterText: string;
};

export const TitleList: VFC<TitlesProps> = (props) => {
  const { titles, uuid, getTitleList, filterText } = props;

  // 漫画タイトルのフィルタリング
  // タイトルもしくは著者名に検索ワードが含まれている場合のみ表示
  const filteredTitle = titles.filter((title) => {
    let searchContent = title.title + ' ' + title.author;
    return searchContent.toLowerCase().includes(filterText.toLowerCase());
  });

  return (
    <div className='grid grid-cols-3 gap-2 m-4 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7 2xl:grid-cols-8'>
      <AddTitle uuid={uuid} getTitleList={getTitleList} />
      {filteredTitle.map((title) => {
        return (
          <Link key={title.id} href={`/title?id=${title.id}`} passHref>
            <div className='p-2 border cursor-pointer'>
              <div className='flex justify-center'>
                {title.image_url ? (
                  <Image
                    src={title.image_url}
                    alt='thumbnail'
                    width={126}
                    height={200}
                  />
                ) : (
                  <Image
                    src={noImage}
                    alt='thumbnail'
                    width={126}
                    height={200}
                  />
                )}
              </div>
              <div className='mt-2 text-center'>{title.title}</div>
            </div>
          </Link>
        );
      })}
    </div>
  );
};
