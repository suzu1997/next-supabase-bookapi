import { Fragment, useCallback, useState, VFC } from 'react';
import { client } from 'src/libs/supabase';
import Image from 'next/image';
import { Dialog, Transition } from '@headlessui/react';
import { Button, IconX, IconPlus } from '@supabase/ui';

import add from 'public/add.png';
import { Title } from './TitleList';
import { SearchSubtitle } from './SearchSubtitle';

type Props = {
  title: Title;
  uuid: string;
  getSubtitleList: VoidFunction;
};

export const AddSubtitle: VFC<Props> = (props) => {
  // ダイアログが開いているかどうか
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [volume, setVolume] = useState<string>('');
  const [isbn, setIsbn] = useState<string>('');
  const [possession, setPossession] = useState<boolean>(false);

  // ダイアログを開く
  const openDialog = useCallback(() => {
    setIsOpen(true);
  }, []);

  // ダイアログを閉じる
  const closeDialog = useCallback(() => {
    setVolume('');
    setIsbn('');
    setPossession(false);
    setIsOpen(false);
  }, []);

  // 書籍の追加
  const handleAdd = useCallback(async () => {
    if (volume === '' || Number(volume) === NaN) {
      alert('Input volume as integer.');
      return;
    }
    if (Number(volume) < 0 || Number(volume) % 1 !== 0) {
      alert('Input volume as positive integer.');
      return;
    }
    if (isbn === '') {
      alert('Input ISBN number.');
      return;
    }
    // openBD を使用してISBN から書籍データを取得
    const res = await fetch('https://api.openbd.jp/v1/get?isbn=' + isbn);
    const openbd = await res.json();
    if (openbd[0] === null) {
      alert('Invalid ISBN number. Please check');
      return;
    }
    const imageUrl = 'https://cover.openbd.jp/' + isbn + '.jpg';
    const { data, error } = await client.from('manga_subtitle').insert([
      {
        user_id: props.uuid,
        title_id: props.title.id,
        volume: Number(volume),
        isbn: isbn.replaceAll('-', ''),
        image_url: imageUrl,
        possession,
      },
    ]);
    if (error) {
      alert(error);
    } else {
      if (data) {
        props.getSubtitleList();
        closeDialog();
      }
    }
  }, [props, volume, isbn, possession, closeDialog]);

  return (
    <>
      <div className='p-2 border cursor-pointer' onClick={openDialog}>
        <div className='flex justify-center'>
          <Image src={add} alt='thumbnail' width={126} height={200} />
        </div>
        <div className='mt-2 text-center'>ADD NEW</div>
      </div>

      <Transition appear show={isOpen} as={Fragment}>
        <Dialog
          as='div'
          className='fixed inset-0 z-10 overflow-y-auto'
          onClose={closeDialog}
        >
          <div className='min-h-screen px-4 text-center border-2'>
            <Transition.Child
              as={Fragment}
              enter='ease-out duration-300'
              enterFrom='opacity-0'
              enterTo='opacity-100'
              leave='ease-in duration-200'
              leaveFrom='opacity-100'
              leaveTo='opacity-0'
            >
              <Dialog.Overlay className='fixed inset-0' />
            </Transition.Child>
            {/* This element is to trick the browser into centering the modal contents. */}
            <span
              className='inline-block h-screen align-middle'
              aria-hidden='true'
            >
              &#8203;
            </span>
            <Transition.Child
              as={Fragment}
              enter='ease-out duration-300'
              enterFrom='opacity-0 scale-95'
              enterTo='opacity-100 scale-100'
              leave='ease-in duration-200'
              leaveFrom='opacity-100 scale-100'
              leaveTo='opacity-0 scale-95'
            >
              <div className='inline-block w-full max-w-md p-6 my-8 overflow-hidden text-left align-middle transition-all transform border border-gray-300 shadow-xl bg-gray-50 rounded-xl'>
                <Dialog.Title
                  as='h3'
                  className='text-2xl font-medium leading-6 text-center text-gray-900'
                >
                  Add Subtitle
                </Dialog.Title>
                <div className='grid grid-cols-4 gap-2 mt-4'>
                  <div className='col-span-1 pt-1 text-xl text-center'>
                    Volume
                  </div>
                  <input
                    type='text'
                    className='w-full h-10 col-span-3 p-2 bg-white border border-gray-300 rounded shadow appearance-none hover:border-gray-500'
                    value={volume}
                    onChange={(e) => {
                      return setVolume(e.target.value);
                    }}
                  />
                </div>
                <div className='grid grid-cols-4 gap-2 mt-4'>
                  <div className='col-span-1 pt-1 text-xl text-center'>
                    ISBN
                  </div>
                  <input
                    type='text'
                    className='w-full h-10 col-span-3 p-2 bg-white border border-gray-300 rounded shadow appearance-none hover:border-gray-500'
                    value={isbn}
                    onChange={(e) => {
                      return setIsbn(e.target.value);
                    }}
                  />
                </div>
                <SearchSubtitle title={props.title} setIsbn={setIsbn} />

                <div className='grid grid-cols-5 gap-2 mt-4'>
                  <div className='col-span-2 pt-1 text-xl text-center'>
                    Possesstion
                  </div>
                  <div className='col-span-3 pt-2 pl-2'>
                    <input
                      type='checkbox'
                      className='scale-150'
                      checked={possession}
                      onChange={() => setPossession(!possession)}
                    />
                  </div>
                </div>

                <div className='flex justify-center mt-4'>
                  <div className='w-32 p-2'>
                    <Button
                      block
                      type='default'
                      size='large'
                      icon={<IconX />}
                      onClick={closeDialog}
                    >
                      Cancel
                    </Button>
                  </div>
                  <div className='w-32 p-2'>
                    <Button
                      block
                      size='large'
                      icon={<IconPlus />}
                      onClick={() => handleAdd()}
                    >
                      Add
                    </Button>
                  </div>
                </div>
              </div>
            </Transition.Child>
          </div>
        </Dialog>
      </Transition>
    </>
  );
};
