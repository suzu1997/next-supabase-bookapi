import { Header } from 'src/components/Header';
import { Footer } from 'src/components/Footer';
import { ReactNode, VFC } from 'react';

type Props = {
  children: ReactNode;
};

export const LayoutWrapper: VFC<Props> = (props) => {
  const { children } = props;

  return (
    <div className='bg-gray-300'>
      <div className='container mx-auto flex flex-col min-h-screen'>
        <Header />
        <main className='flex-1 px-4 text-gray-600 bg-gray-100'>
          {children}
        </main>
        <Footer />
      </div>
    </div>
  );
};
