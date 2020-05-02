import {gql} from 'apollo-boost';
import {useMutation, useQuery} from '@apollo/react-hooks';
import {useParams} from 'react-router-dom';
import React, {useState} from 'react';
import classnames from 'classnames';
import styled from 'styled-components';

interface Option {
  id: number;
  name: string;
}

const range = (length: number) => [...Array(length).keys()];

const GET_POLL = gql`
  query GetPoll($id: ID!) {
    poll(id: $id) {
      options {
        id
        name
      }
    }
  }
`;

const VOTE = gql`
  mutation Vote($pollId: ID!, $preferences: [ID!]!) {
    vote(pollId: $pollId, preferences: $preferences) {
      createdAt
    }
  }
`;

interface PollQueryData {
  poll: {
    name: string;
    options: Option[];
  };
}

interface PollQueryVars {
  id: string;
  userId: string;
}

export default () => {
  const {code} = useParams();
  const [pollId, userId] = atob(code).split(':');
  const [preferences, setPreferences] = useState<number[]>([]);

  const pollQuery = useQuery<PollQueryData, PollQueryVars>(GET_POLL, {
    variables: {id: pollId, userId},
  });

  const [vote, voteMutation] = useMutation(VOTE, {
    variables: {pollId, preferences, userId},
  });

  const options: Option[] =
    pollQuery.data?.poll.options.map(({id, name}) => ({id, name})) || [];

  const toggle = (option: Option) => {
    if (preferences.includes(option.id)) {
      setPreferences(preferences.filter(id => id !== option.id));
    } else {
      setPreferences([...preferences, option.id]);
    }
  };

  const movePreference = (option: Option, nextPosition: number) => {
    const nextIndex = nextPosition - 1;
    const currentIndex = preferences.indexOf(option.id);

    let newPreferences = [...preferences];

    // Remove existing
    if (currentIndex > -1) {
      newPreferences.splice(currentIndex, 1);
    }

    newPreferences.splice(nextIndex, 0, option.id); // Drop in new preference
    setPreferences(newPreferences);
  };

  const sorted = options.sort(
    (a, b) =>
      (preferences.includes(a.id) ? preferences.indexOf(a.id) : Infinity) -
      (preferences.includes(b.id) ? preferences.indexOf(b.id) : Infinity),
  );

  return (
    <Wrap>
      <h1>Vote for your faves</h1>
      {!!voteMutation?.data && <p>Your vote has been cast. You can defs vote again, but it will just update your previous one.</p>}
      {!voteMutation?.data && (
        <p>Click the options in order of preference (highest first)</p>
      )}
      <List>
        {sorted.map(option => {
          const isActive = preferences.includes(option.id);
          const index = preferences.indexOf(option.id);
          return (
            <Item
              className={classnames({active: isActive})}
              onClick={index === -1 ? () => toggle(option) : undefined}
              key={option.id}>
              <Box
                value={index + 1}
                onClick={event => event.stopPropagation()}
                onChange={event =>
                  movePreference(option, parseInt(event.target.value, 10))
                }>
                <option />
                {range(options.length).map(i => (
                  <option key={i}>{i + 1}</option>
                ))}
              </Box>
              {option.name}
            </Item>
          );
        })}
      </List>

      <Button onClick={() => vote()}>Vote!</Button>
    </Wrap>
  );
};

const Box = styled.select`
  align-items: center;
  border: 2px solid #b3e5fc;
  display: flex;
  font-size: 0.75rem;
  padding: 0.125rem;
  justify-content: center;
  margin-right: 1rem;
`;

const Button = styled.button`
  background: #01579b;
  border: none;
  color: #fff;
  cursor: pointer;
  font: inherit;
  font-size: 1.125rem;
  font-weight: bold;
  margin-top: 2rem;
  padding: 0.75rem 2rem;
`;

const Item = styled.li`
  background: #e1f5fe;
  padding: 1rem 1.25rem;
  margin: 0.25rem 0;
  border-radius: 0.5rem;
  border: 1px solid #e1f5fe;
  cursor: pointer;
  display: flex;
  align-items: center;

  &.active {
    background: #ffffff;
    border: 1px solid #b3e5fc;
    font-weight: bold;
  }
`;

const List = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
  max-width: 24rem;
  width: 100%;
`;

const Wrap = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  flex-direction: column;
`;
