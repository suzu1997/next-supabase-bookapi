import {
  VFC,
  useCallback,
  Dispatch,
  SetStateAction,
  RefObject,
  MouseEventHandler,
} from 'react';
import Image from 'next/image';

import { BookData } from 'src/pages/api/rakuten';

type Props = {
  bookList: BookData[];
  setIsbn: Dispatch<SetStateAction<string>>;
  close: RefObject<HTMLButtonElement>;
};

export const BookList: VFC<Props> = (props) => {
  // 選択したISBNをテキストボックスにセット
  const handleClick = useCallback(
    (isbn: string) => {
      props.setIsbn(isbn);
      props.close.current?.click();
    },
    [props]
  );

  return (
    <div className='grid grid-cols-3 gap-2 m-4'>
      {props.bookList.map((book, index) => {
        return (
          <div
            key={index}
            className='p-2 border cursor-pointer'
            onClick={() => handleClick(book.isbn)}
          >
            <div className='flex justify-centerc'>
              <Image
                src={book.imageUrl}
                alt='thumbnail'
                width={126}
                height={200}
              />
            </div>
            <div className='mt-2 text-sm text-center'>{book.title}</div>
          </div>
        );
      })}
    </div>
  );
};
