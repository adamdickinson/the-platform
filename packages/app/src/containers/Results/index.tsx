import {gql} from 'apollo-boost';
import {useParams} from 'react-router-dom';
import {useQuery} from '@apollo/react-hooks';
import React, {useEffect, useState} from 'react';
import classnames from 'classnames';
import styled from 'styled-components';

import antony from '../../assets/you-betcha.png';
import vote from '../Vote';

interface Option {
  id: string;
  name: string;
}

interface Round {
  votes: Option[];
  losers: Option[];
}

interface ResultData {
  result: {
    rounds: Round[];
    winners: Option[];
  };
}

const GET_RESULT = gql`
  query GetResult($pollId: ID!) {
    result(pollId: $pollId) {
      rounds {
        votes {
          id
          name
        }
        losers {
          id
          name
        }
      }
      winners {
        name
      }
    }
  }
`;

export default () => {
  const {pollId} = useParams();
  const {loading, data} = useQuery<ResultData>(GET_RESULT, {
    variables: {pollId, userId: 'adam'},
  });
  const {rounds, winners} = data?.result || {};
  const [step, setStep] = useState(1);

  useEffect(() => {
    let step = 2;
    const interval = setInterval(() => {
      setStep(step++);
      if (step === rounds?.length) {
        clearInterval(interval);
      }
    }, 2000);
  }, []);

  let activeRound = Math.floor(step / 2);
  const done = activeRound >= rounds?.length;
  const roundsToShow = rounds?.slice(1, activeRound + 1);
  let stage = step % 2;

  return (
    <Wrap style={{'--antony-opacity': done ? 1 : 0} as any}>
      <h1>Voting Result</h1>
      {loading && 'Getting result...'}
      <Lines
        style={
          {'--num-voters': data?.result.rounds[0].votes.length || 0} as any
        }>
        {rounds?.slice(1).map((round: Round, index: number) => {
          const active = activeRound === index + 1;
          const nextRound = rounds[index + 2];
          const hidden = !roundsToShow.includes(round);
          return (
            <React.Fragment key={index}>
              <h2 className={classnames({active, hidden})}>Round {index + 1}</h2>
              <Divider className={classnames({ hidden })} />
              {round.votes.map((vote, v) => (
                <Vote
                  className={classnames({
                    active,
                    hidden,
                    out: (stage === 1 || activeRound > index + 1) && nextRound?.losers.some(({ id }) => id === vote.id),
                  })}
                  key={v}>
                  {vote.name}
                </Vote>
              ))}
              <Filler className={classnames({active, hidden})} />
            </React.Fragment>
          );
        })}

        {!!winners && !!roundsToShow && done && (
          <>
            <h2 className="active">Winners</h2>
            <Divider />
            <Winners className="active">
              {data?.result.winners.map(({name}) => name).join(', ')}
            </Winners>
            <Filler className="active" />
          </>
        )}
      </Lines>
    </Wrap>
  );
};

const Divider = styled.div`
  height: 100%;
  width: 1px;
  background: var(--tint-2);
`;

const Filler = styled.div`
  height: 100%;
`;

const Winners = styled.div`
  grid-column: 3 / calc(3 + var(--num-voters));
  padding: 2rem;
  color: var(--active);
`;

const Vote = styled.span`
  line-height: 1;
  display: block;
  padding: 2rem;

  &.active {
    color: var(--active);

    &.out {
      color: var(--invalid);
    }
  }

  &.out {
    color: var(--disabled);
    text-decoration: line-through;
  }
`;

const Lines = styled.div`
  display: grid;
  position: relative;
  margin: 0 -3rem;
  grid-template-columns:
    12rem 1px repeat(var(--num-voters), minmax(max-content, 8rem))
    1fr;
  grid-auto-rows: 1fr;
  align-items: center;

  h2 {
    flex: 0 0 auto;
    margin: 0 2rem 0 0;
    font-size: 1em;
    width: 8rem;
    text-transform: uppercase;
    color: var(--disabled);
    text-align: right;
    padding: 2rem;
    line-height: 1;

    &.active {
      color: var(--foreground);
    }
  }

  > * {
    transition: 300ms color, 300ms background-color, 300ms opacity;
  }

  .active {
    background: var(--tint-1);
    font-weight: bold;
  }

  .hidden {
    opacity: 0;
  }
`;

const Wrap = styled.div`
  padding: 3rem;

  :after {
    content: '';
    position: fixed;
    bottom: 0;
    right: 0;
    background: no-repeat 100% 100% url(${antony});
    background-size: contain;
    height: 40vh;
    width: 100%;
    opacity: var(--antony-opacity);
  }
`;
