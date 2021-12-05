import type { NextPage } from 'next';
import { ReactNode, VFC } from 'react';
import { Auth, Button, IconLogOut } from '@supabase/ui';

import { LayoutWrapper } from 'src/components/LayoutWrapper';
// 作成したSupabeseクライアントをインポート
import { client } from 'src/libs/supabase';

type Props = {
  children: ReactNode;
};

const Container: VFC<Props> = (props) => {
  const { children } = props;
  // ログイン状態を取得
  const { user } = Auth.useUser();

  // ログインしている場合 ログイン画面を表示
  if (user) {
    return (
      <div className='flex justify-end mx-2 my-4'>
        <Button
          size='medium'
          icon={<IconLogOut />}
          onClick={() => client.auth.signOut()}
        >
          Sign out
        </Button>
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
