import React, {useState} from 'react';
import classnames from 'classnames';
import styled from 'styled-components';

interface Option {
  id: number;
  name: string;
}

const items = [
  'Klaus',
  'Baabhubali',
  'Annabelle Comes Home',
  'Roma',
  'A Cure for Wellness',
];

export default () => {
  const [options, setOptions] = useState<Option[]>([
    {name: 'Klaus', id: 1},
    {name: 'Baabhubali', id: 2},
    {name: 'Annabelle Comes Home', id: 3},
    {name: 'Roma', id: 4},
    {name: 'A Cure for Wellness', id: 5},
  ]);
  const [preferences, setPreferences] = useState<number[]>([]);

  const toggle = (option: Option) => {
    if (preferences.includes(option.id)) {
      setPreferences(preferences.filter(id => id !== option.id));
    } else {
      setPreferences([...preferences, option.id]);
    }
  };

  const sorted = options.sort(
    (a, b) =>
      (preferences.includes(a.id) ? preferences.indexOf(a.id) : Infinity) -
      (preferences.includes(b.id) ? preferences.indexOf(b.id) : Infinity),
  );

  return (
    <Wrap>
      <h1>Vote for your faves</h1>
      <p>Click the options in order of preference (highest first)</p>
      <List>
        {sorted.map(option => (
          <Item
            className={classnames({active: preferences.includes(option.id)})}
            onClick={() => toggle(option)}
            key={option.id}>
            <Box>{preferences.indexOf(option.id) + 1 || ''}</Box>
            {option.name}
          </Item>
        ))}
      </List>

      <Button>Vote!</Button>
    </Wrap>
  );
};

const Box = styled.i`
  align-items: center;
  border: 2px solid #b3e5fc;
  display: flex;
  height: 1rem;
  justify-content: center;
  margin-right: 1rem;
  padding: 0.25rem;
  width: 1rem;
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
