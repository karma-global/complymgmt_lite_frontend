import { useState, useMemo, useEffect } from 'react';
import ModuleFilter from './ModuleFilter';
import StatsPanel from './StatsPanel';
import LocationList from './LocationList';
import { fetchClientOnboardingByCompany } from '../../../api/service';

function ClientOnBoardingByCompany({selectedCompany}) {

  const [selectedModule, setSelectedModule] = useState('all');
  const[locationData,setLocationData]=useState([]);
   useEffect(() => {
        const fetchClientOnboardingPortfolioData = async () => {
            const [a] = await Promise.allSettled([
                fetchClientOnboardingByCompany(selectedCompany),
            ]);

            setLocationData(a.status === "fulfilled" ? a.value : []);
        };
        fetchClientOnboardingPortfolioData();
    }, [selectedCompany]);
  const filteredLocations = useMemo(() => {
    let locations = Object?.keys(locationData.location_module_map || {});
    if (selectedModule !== 'all') {
      locations = locations?.filter(loc =>
        locationData?.location_module_map[loc]?.includes(selectedModule)
      );
    }

    return locations?.sort();
  }, [locationData.location_module_map, selectedModule]);

 if (!locationData || Object.keys(locationData).length === 0) {
        return <div className='no-data'>{locationData === 403 ? 'No Data Found' : 'Loading...'}</div>;
    }
  return (
    <div className="">
      <div className="content-wrapper">
        <aside className="">
          <StatsPanel
            totalLocations={Object.keys(locationData.location_module_map || {}).length}
            filteredLocations={filteredLocations.length}
            totalModules={locationData.modules_subscribed?.length ?? 0}
          />


        </aside>

        <main className="main-content">
          <div className='row'>
            <div className='col'>
              <ModuleFilter
                selectedModule={selectedModule}
                onModuleChange={setSelectedModule}
                modules={locationData.modules_subscribed || []}
              />
            </div>
            <div className='col'>
              <LocationList
                locations={filteredLocations}
                locationModuleMap={locationData.location_module_map || {}}
                selectedModule={selectedModule}
              />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

export default ClientOnBoardingByCompany;
