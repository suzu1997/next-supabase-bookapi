import { Fragment, useCallback, useState, VFC } from 'react';
import { client } from 'src/libs/supabase';
import Image from 'next/image';
import { Dialog, Transition } from '@headlessui/react';
import { Button, IconX, IconPlus } from '@supabase/ui';

import add from 'public/add.png';

type Props = {
  uuid: string;
  getTitleList: VoidFunction;
};

export const AddTitle: VFC<Props> = (props) => {
  const { getTitleList, uuid } = props;

  // ダイアログが開いているかどうか
  const [isOpen, setIsOpen] = useState<boolean>(false);
  // 漫画のタイトル
  const [title, setTitle] = useState<string>('');

  const [author, setAuthor] = useState<string>('');

  // ダイアログを開く
  const openDialog = useCallback(() => {
    setIsOpen(true);
  }, []);

  // ダイアログを閉じる
  const closeDialog = useCallback(() => {
    setIsOpen(false);
  }, []);

  // 漫画タイトルをDBに追加
  const handleAdd = useCallback(
    async (uuid: string) => {
      if (title === '') {
        alert('Input title.');
        return;
      }
      // DB として manga_title を選択し、insert でデータを追加
      const { data, error } = await client
        .from('manga_title')
        .insert([{ user_id: uuid, title, author }]);
      if (error) {
        alert(error);
      } else {
        if (data) {
          getTitleList();
          closeDialog();
        }
      }
    },
    [title, author, getTitleList, closeDialog]
  );

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
                  Add Title
                </Dialog.Title>
                <div className='grid grid-cols-4 gap-2 mt-4'>
                  <div className='col-span-1 text-xl text-center'>Title</div>
                  <input
                    type='text'
                    className='w-full h-10 col-span-3 p-2 bg-white border border-gray-300 rounded shadow appearance-none hover:border-gray-500'
                    value={title}
                    onChange={(e) => {
                      return setTitle(e.target.value);
                    }}
                  />
                </div>
                <div className='grid grid-cols-4 gap-2 mt-4'>
                  <div className='col-span-1 text-xl text-center'>Author</div>
                  <input
                    type='text'
                    className='w-full h-10 col-span-3 p-2 bg-white border border-gray-300 rounded shadow appearance-none hover:border-gray-500'
                    value={author}
                    onChange={(e) => {
                      return setAuthor(e.target.value);
                    }}
                  />
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
                      onClick={() => handleAdd(uuid)}
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
