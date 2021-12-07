import { Fragment, useCallback, useState, VFC } from 'react';
import Image from 'next/image';
import { Dialog, Transition } from '@headlessui/react';
import { Disclosure } from '@headlessui/react';
import { ChevronUpIcon } from '@heroicons/react/solid';

import { client } from 'src/libs/supabase';
import { Title } from './TitleList';
import noImage from 'public/no_image.png';
import { Button, IconSave, IconTrash2, IconX } from '@supabase/ui';
import { Subtitle } from 'src/pages/title';

type Props = {
  subtitle: Subtitle;
  title: Title;
  uuid: string;
  getSubtitleList: VoidFunction;
};

// 書籍情報(subtitle)の編集ページ
export const SubtitleCard: VFC<Props> = (props) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [volume, setVolume] = useState<string>(
    props.subtitle.volume.toString()
  );
  const [isbn, setIsbn] = useState<string>(props.subtitle.isbn.toString());
  const [possession, setPossession] = useState<boolean>(
    props.subtitle.possession
  );

  // ダイアログを閉じる
  const closeModal = useCallback(() => {
    setIsOpen(false);
  }, []);

  // ダイアログを開く
  const openModal = () => {
    setIsOpen(true);
  };

  let color = 'grayscale';
  if (props.subtitle.possession) {
    color = 'grayscale-0';
  }

  // サムネイルの設定
  // その巻のサムネイルをタイトルのサムネイルに設定
  const handleSetThumbnail = useCallback(async () => {
    let title = props.title;
    title.image_url = props.subtitle.image_url;
    const { error } = await client.from('manga_title').upsert(title);
    if (error) {
      alert(error);
      closeModal();
    }
  }, [props, closeModal]);

  // 書籍の削除
  const handleRemove = useCallback(async () => {
    const { error } = await client
      .from('manga_subtitle')
      .delete()
      .eq('id', props.subtitle.id);
    if (error) {
      alert(error);
      props.getSubtitleList();
      closeModal();
    }
  }, [props, closeModal]);

  // 書籍の修正内容を登録
  const handleSave = useCallback(async () => {
    if (volume === '' || Number(volume) === NaN) {
      alert('Input volume as an integer.');
      return;
    }
    if (Number(volume) < 0 || Number(volume) % 1 !== 0) {
      alert('Input volume as an integer.');
      return;
    }
    if (isbn === '') {
      alert('Input ISBN number.');
      return;
    }
    // OpenBDを用いてISBNから書籍情報を取得
    const res = await fetch('https://api.openbd.jp/v1/get?isbn=' + isbn);
    const openbd = await res.json();
    if (!openbd) {
      alert('Could not get the data from openBD.');
    }
    if (openbd[0] === null) {
      alert('Invalid ISBN number. Please check.');
      return;
    }
    const imageUrl = 'https://cover.openbd.jp/' + isbn + '.jpg';
    const { error } = await client.from('manga_subtitle').upsert({
      id: props.subtitle.id,
      user_id: props.subtitle.user_id,
      title_id: props.subtitle.title_id,
      volume: Number(volume),
      isbn: isbn.replace('-', ''),
      image_url: imageUrl,
      possession: possession,
    });
    if (error) {
      alert(error);
    }
    props.getSubtitleList();
    closeModal();
  }, [isbn, volume, props, closeModal, possession]);

  return (
    <>
      <div className='p-2 border curdor-pointer' onClick={openModal}>
        <div className={color}>
          <div className='flex justify-center'>
            {props.subtitle.image_url ? (
              <Image
                src={props.subtitle.image_url}
                alt='thumbnail'
                width={126}
                height={200}
              />
            ) : (
              <Image src={noImage} alt='thumbnail' width={126} height={200} />
            )}
          </div>
        </div>
        <div className='mt-2 text-center'>({props.subtitle.volume})</div>
      </div>

      <Transition appear show={isOpen} as={Fragment}>
        <Dialog
          as='div'
          className='fixed inset-0 z-10 overflow-y-auto'
          onClose={closeModal}
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
              <div className='inline-block w-full max-w-md p-6 my-8 overflow-hidden text-left align-middle transition-all transform border border-gray-300  shadow-xl rounded-xl bg-gray-50'>
                <Dialog.Title
                  as='h3'
                  className='text-2xl font-medium leading-6 text-gray-900 text-center'
                >
                  Add Subtitle
                </Dialog.Title>
                <div className='grid grid-cols-4 gap-2 mt-4'>
                  <div className='col-span-1 pt-1 text-xl text-center'>
                    Volume
                  </div>
                  <input
                    type='text'
                    className='w-full h-10  col-span-3 p-2 bg-white border border-gray-300 rounded shadow appearance-none hover:border-gray-500'
                    value={volume}
                    onChange={(e) => setVolume(e.target.value)}
                  />
                </div>
                <div className='grid grid-cols-4 gap-2 mt-4'>
                  <div className='col-span-1 pt-1 text-xl text-center'>
                    ISBN
                  </div>
                  <input
                    type='text'
                    className='w-full h-10  col-span-3 p-2 bg-white border border-gray-300 rounded shadow appearance-none hover:border-gray-500'
                    value={isbn}
                    onChange={(e) => setIsbn(e.target.value)}
                  />
                </div>
                <div className='grid grid-cols-5 gap-2 mt-4'>
                  <div className='col-span-2 pt-1 text-xl text-center'>
                    Possession
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
                <div className='pt-4 mx-4'>
                  <Button block size='medium' onClick={handleSetThumbnail}>
                    SET TO THUMBNAIL
                  </Button>
                </div>
                <div className='mx-4 mt-4 bg-blue-50'>
                  {/* 削除ボタンはディスクロージャーの中に隠す */}
                  <Disclosure>
                    {({ open }) => (
                      <>
                        <Disclosure.Button className='flex justify-between w-full px-4 py-2 text-sm font-medium text-left text-blue-500 bg-blue-100 rounded-lg hover:bg-blue-200 focus:outline-none focus-visible:ring focus-visible:ring-blue-500 focus-visible:ring-opacity-75'>
                          <span>REMOVE THIS</span>
                          <ChevronUpIcon
                            className={`${
                              open ? 'transform rotate-180' : ''
                            } w-5 h-5 text-blue-500`}
                          />
                        </Disclosure.Button>
                        <Disclosure.Panel className='p-4 text-md text-gray-500'>
                          <Button
                            block
                            onClick={handleRemove}
                            icon={<IconTrash2 />}
                          >
                            REMOVE
                          </Button>
                        </Disclosure.Panel>
                      </>
                    )}
                  </Disclosure>
                </div>

                <div className='flex justify-center mt-4'>
                  <div className='w-32 p-2 flex justify-center gap-2'>
                    <Button
                      block
                      type='default'
                      size='large'
                      icon={<IconX />}
                      onClick={closeModal}
                    >
                      Cancel
                    </Button>
                    <Button
                      block
                      size='large'
                      icon={<IconSave />}
                      onClick={handleSave}
                    >
                      Save
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
