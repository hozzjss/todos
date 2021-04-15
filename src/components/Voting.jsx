import React, { useEffect, useState } from 'react';
import { Flex, Box, Text } from '@blockstack/ui';
import {vote} from '../storage';
const VotingStatus = {
  Voting: 0,
  Voted: 1
}

const didVote = Boolean(null && localStorage.getItem('voted-v1'));

export const Voting = () => {
  const [votingStatus, setVotingStatus] = useState(didVote ? VotingStatus.Voted : VotingStatus.Voting);
  useEffect(() => {
    if (!didVote) {
      vote()
        .then((data) => {
          console.log(data);
          setVotingStatus(VotingStatus.Voted)
          localStorage.setItem('voted-v1', 'true');
        });
    }

  }, [])
  return (
    <Flex>
      <Box maxWidth="660px" width="100%" mx="auto" mt="75px">
        <Flex width="100%" flexWrap="wrap">
          <Box mb={4} width="100%">
            <Text textStyle="display.large" fontSize={7}>
              {votingStatus === VotingStatus.Voting ? 'Voting...' : 'You already voted!'}
            </Text>
          </Box>
        </Flex>
      </Box>
    </Flex>
  );
};
