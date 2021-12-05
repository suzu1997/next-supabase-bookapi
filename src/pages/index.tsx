import type { NextPage } from 'next';
import { ReactNode, useCallback, useEffect, useState, VFC } from 'react';
import { Auth, Button, IconLogOut } from '@supabase/ui';

import { LayoutWrapper } from 'src/components/LayoutWrapper';
// 作成したSupabeseクライアントをインポート
import { client } from 'src/libs/supabase';
import { Title, TitleList } from 'src/components/TitleList';

type Props = {
  children: ReactNode;
};

// DBから漫画タイトルを取得
const getTitles = async () => {
  const { data, error } = await client
    .from('manga_title')
    .select('*')
    .order('title');
  if (!error && data) {
    return data;
  }
  return [];
};

const Container: VFC<Props> = (props) => {
  const { children } = props;
  // ログイン状態を取得
  const { user } = Auth.useUser();
  const [text, setText] = useState<string>('');
  const [titles, setTitles] = useState<Title[]>([]);

  // DBから取得した漫画タイトルをセット
  const getTitleList = useCallback(async () => {
    const data = await getTitles();
    setTitles(data);
  }, []);

  useEffect(() => {
    getTitleList();
  }, [user, getTitleList]);

  // ログインしている場合
  if (user) {
    return (
      <div>
        <div className='flex justify-center gap-2 p-4'>
          <input
            type='text'
            className='w-full h-12 px-4 bg-white border border-gray-300 rounded shadow appearance-none hover:border-gray-500'
            placeholder='Filtering text'
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
        </div>
        <TitleList
          titles={titles}
          uuid={user.id}
          getTitleList={getTitleList}
          filterText={text}
        />
        <div className='flex justify-end mx-2 my-4'>
          <Button
            size='medium'
            icon={<IconLogOut />}
            onClick={() => client.auth.signOut()}
          >
            Sign out
          </Button>
        </div>
      </div>
    );
  }

  // ログインしていない場合
  return <>{children}</>;
};

const Home: NextPage = () => {
  return (
    <LayoutWrapper>
      <Auth.UserContextProvider supabaseClient={client}>
        <Container>
          <div className='flex justify-center pt-8'>
            <div className='w-full sm:w-96'>
              <Auth
                supabaseClient={client}
                providers={['github', 'google']}
                socialColors={true}
              />
            </div>
          </div>
        </Container>
      </Auth.UserContextProvider>
    </LayoutWrapper>
  );
};

export default Home;
