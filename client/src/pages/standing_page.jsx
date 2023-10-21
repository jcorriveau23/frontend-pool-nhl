import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';

// components
import TeamsStanding from '../components/standing_page/teamsStanding';
import SeasonOption from '../components/seasonOptions';
import Playoff from '../components/standing_page/playoff';

export default function StandingPage() {
  const [seasonParams, setSeasonParams] = useSearchParams();
  const [season, setSeason] = useState(seasonParams.get('season') ?? '20232024');

  return (
    <div className="cont">
      <SeasonOption
        season={season}
        setSeason={setSeason}
        seasonParams={seasonParams}
        setSeasonParams={setSeasonParams}
      />
      <Tabs>
        <TabList>
          <Tab>Standing</Tab>
          <Tab>Playoff</Tab>
        </TabList>
        <TabPanel>
          <TeamsStanding season={season} />
        </TabPanel>
        <TabPanel>
          <Playoff season={season} />
        </TabPanel>
      </Tabs>
    </div>
  );
}
