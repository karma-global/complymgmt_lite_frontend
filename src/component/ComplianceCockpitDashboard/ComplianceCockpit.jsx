import React from 'react';
import '../../style/complianceCockpit.css';
import ClientOnboarding from './ClientOnboarding';
import ComplianceHealth from './ComplianceHealth';
import NavigationTabs from './NavigationTabs';
import PayrollSection from './PayrollSection';
import FinanceBilling from './FinanceBilling';
import GeneralCompliance from './GeneralCompliance';

const ComplianceCockpit = () => {

  return (
    <div className="compliance-cockpit">
      {/* <div className="cockpit-header service-tracker-inner-page-header">
        <h1 className="cockpit-title">Compliance Cockpit</h1>
        <NavigationTabs activeTab={activeTab} setActiveTab={setActiveTab} />
      </div> */}

      <div className="dashboard-grid">
        <div className="left-section">
          <ComplianceHealth />
          <FinanceBilling />
        </div>

        <div className="center-section">
          <ClientOnboarding />
        </div>

        <div className="right-section">
          <PayrollSection />
          <GeneralCompliance />
        </div>
      </div>
    </div>
  );
};

export default ComplianceCockpit;