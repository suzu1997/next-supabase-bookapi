import { VFC } from 'react';
import { AddSubtitle } from './AddSubtitle';
import { Subtitle } from 'src/pages/title';
import { SubtitleCard } from './SubtitleCard';

export type Title = {
  id: number;
  user_id: string;
  title: string;
  author: string;
  image_url: string;
};

type Props = {
  uuid: string;
  title: Title;
  subTitles: Subtitle[];
  getSubtitleList: VoidFunction;
};

export const SubtitleList: VFC<Props> = (props) => {
  return (
    <div className='grid grid-cols-3 gap-2 m-4 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7 2xl:grid-cols-8'>
      <AddSubtitle
        title={props.title}
        uuid={props.uuid}
        getSubtitleList={props.getSubtitleList}
      />
      {props.subTitles.map((subtitle) => {
        return (
          <div key={subtitle.id}>
            <SubtitleCard
              subtitle={subtitle}
              title={props.title}
              uuid={props.uuid}
              getSubtitleList={props.getSubtitleList}
            />
          </div>
        );
      })}
    </div>
  );
};
