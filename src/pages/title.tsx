import { Auth, Button, IconCornerDownLeft } from '@supabase/ui';
import type { NextPage } from 'next';
import { useRouter } from 'next/router';
import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';

import { EditTitle } from 'src/components/EditTitle';
import { LayoutWrapper } from 'src/components/LayoutWrapper';
import { Title } from 'src/components/TitleList';
import { client } from 'src/libs/supabase';
import { SubtitleList } from 'src/components/SubtitleList';

export type Subtitle = {
  id: number;
  user_id: string;
  title_id: number;
  volume: number;
  isbn: number;
  image_url: string;
  possession: boolean;
};

// DBから登録済みのサブタイトルを取得
const getSubtitles = async (id: string) => {
  // IDから漫画のタイトルを取得
  let { data, error } = await client
    .from('manga_title')
    .select('*')
    .eq('id', id);
  if (!error && data) {
    // 漫画のタイトルに該当する書籍を取得
    const title = data[0];
    ({ data, error } = await client
      .from('manga_subtitle')
      .select('*')
      .order('volume', { ascending: true })
      .eq('title_id', id));
    if (!error && data) {
      return { title, subtitles: data };
    } else {
      return { title, subtitles: null };
    }
  }
  return { title: null, subtitles: null };
};

const Title: NextPage = () => {
  const Container = () => {
    // ユーザー情報を取得
    const { user } = Auth.useUser();

    const [title, setTitle] = useState<Title>();
    const [subTitles, setSubtitles] = useState<Subtitle[]>([]);

    const router = useRouter();
    const { id } = router.query;

    // DBから取得したサブタイトルをセット
    const getSubTitleList = useCallback(async () => {
      if (id) {
        const { title, subtitles } = await getSubtitles(id.toString());
        if (title) {
          setTitle(title);
        } else {
          router.push('/');
        }
        if (subtitles) {
          setSubtitles(subtitles);
        }
      }
    }, [id, router]);

    useEffect(() => {
      getSubTitleList();
    }, [user, getSubTitleList]);

    if (user) {
      return (
        <div>
          <div className='flex justify-end gap-2 mr-2 mt-2'>
            {title && (
              <div className='w-24'>
                <EditTitle title={title} getSubTitleList={getSubTitleList} />
              </div>
            )}
            <div className='w-24'>
              <Link href='/' passHref>
                <Button block size='medium' icon={<IconCornerDownLeft />}>
                  BACK
                </Button>
              </Link>
            </div>
          </div>
          {title && (
            <>
              <h2 className='pb-4 text-4xl font-bold text-center'>
                {title.title}
              </h2>
              <p className='pb-4 text-2xl font-semibold text-center'>
                {title.author}
              </p>
            </>
          )}
          {title && (
            <SubtitleList
              uuid={user.id}
              title={title}
              subTitles={subTitles}
              getSubtitleList={getSubTitleList}
            />
          )}
        </div>
      );
    } else {
      return <div>ログインしてください</div>;
    }
  };

  return (
    <LayoutWrapper>
      <Auth.UserContextProvider supabaseClient={client}>
        <Container />
      </Auth.UserContextProvider>
    </LayoutWrapper>
  );
};

export default Title;
