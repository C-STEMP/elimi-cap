"use client";

import React from "react";
import { DeleteAccountModal } from "./DeleteAccountModal";
import { useSettingsViewState, SettingsSubTab } from "../hooks/useSettingsViewState";
import { SettingsSidebar } from "./SettingsSidebar";
import { ProfileSettingsTab } from "./ProfileSettingsTab";
import { CentreSettingsTab } from "./CentreSettingsTab";
import { PricingSettingsTab } from "./PricingSettingsTab";
import { SecuritySettingsTab } from "./SecuritySettingsTab";

export type { SettingsSubTab };

export const SettingsView: React.FC = () => {
  const state = useSettingsViewState();

  return (
    <div className="w-full flex flex-col gap-6 select-text">
      <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <SettingsSidebar
          logoPreview={state.logoPreview}
          fileInputRef={state.fileInputRef}
          handlePictureChange={state.handlePictureChange}
          activeSubTab={state.activeSubTab}
          setActiveSubTab={state.setActiveSubTab}
          onOpenDeleteModal={() => state.setIsDeleteModalOpen(true)}
        />

        {/* Right Content Panel */}
        <div className="lg:col-span-8 xl:col-span-9 bg-white rounded-3xl p-6 sm:p-8 shadow-2xs border border-gray-100/80 flex flex-col gap-6">
          {state.activeSubTab === "profile" && (
            <ProfileSettingsTab
              firstName={state.firstName}
              setFirstName={state.setFirstName}
              lastName={state.lastName}
              setLastName={state.setLastName}
              middleName={state.middleName}
              setMiddleName={state.setMiddleName}
              dob={state.dob}
              setDob={state.setDob}
              gender={state.gender}
              setGender={state.setGender}
              nationality={state.nationality}
              setNationality={state.setNationality}
              profileEmail={state.profileEmail}
              setProfileEmail={state.setProfileEmail}
              profilePhone={state.profilePhone}
              setProfilePhone={state.setProfilePhone}
              profileCountry={state.profileCountry}
              setProfileCountry={state.setProfileCountry}
              profileState={state.profileState}
              setProfileState={state.setProfileState}
              profileLga={state.profileLga}
              setProfileLga={state.setProfileLga}
              profileStreet={state.profileStreet}
              setProfileStreet={state.setProfileStreet}
              emailNotifications={state.emailNotifications}
              setEmailNotifications={state.setEmailNotifications}
              sessionReminders={state.sessionReminders}
              setSessionReminders={state.setSessionReminders}
              countries={state.countries}
              profileStates={state.profileStates}
              profileCities={state.profileCities}
              handleSaveProfileSettings={state.handleSaveProfileSettings}
              isSavingProfile={state.isSavingProfile}
            />
          )}

          {state.activeSubTab === "centre" && (
            <CentreSettingsTab
              centreName={state.centreName}
              setCentreName={state.setCentreName}
              regNo={state.regNo}
              setRegNo={state.setRegNo}
              centreCountry={state.centreCountry}
              setCentreCountry={state.setCentreCountry}
              centreState={state.centreState}
              setCentreState={state.setCentreState}
              centreLga={state.centreLga}
              setCentreLga={state.setCentreLga}
              centreStreet={state.centreStreet}
              setCentreStreet={state.setCentreStreet}
              supportEmail={state.supportEmail}
              setSupportEmail={state.setSupportEmail}
              supportPhone={state.supportPhone}
              setSupportPhone={state.setSupportPhone}
              bank={state.bank}
              setBank={state.setBank}
              accountNumber={state.accountNumber}
              setAccountNumber={state.setAccountNumber}
              accountName={state.accountName}
              setAccountName={state.setAccountName}
              isResolvingAccount={state.isResolvingAccount}
              accountResolveSuccess={state.accountResolveSuccess}
              bankOptions={state.bankOptions}
              countries={state.countries}
              centreStates={state.centreStates}
              centreCities={state.centreCities}
              handleSaveCentreSettings={state.handleSaveCentreSettings}
              isSavingCentre={state.isSavingCentre}
            />
          )}

          {state.activeSubTab === "pricing" && (
            <PricingSettingsTab
              rplCurrency={state.rplCurrency}
              setRplCurrency={state.setRplCurrency}
              rplAmount={state.rplAmount}
              setRplAmount={state.setRplAmount}
              standardCurrency={state.standardCurrency}
              setStandardCurrency={state.setStandardCurrency}
              standardAmount={state.standardAmount}
              setStandardAmount={state.setStandardAmount}
              handleSavePricingSettings={state.handleSavePricingSettings}
              isSavingPricing={state.isSavingPricing}
            />
          )}

          {state.activeSubTab === "security" && (
            <SecuritySettingsTab
              currentPassword={state.currentPassword}
              setCurrentPassword={state.setCurrentPassword}
              newPassword={state.newPassword}
              setNewPassword={state.setNewPassword}
              confirmPassword={state.confirmPassword}
              setConfirmPassword={state.setConfirmPassword}
              showCurrentPassword={state.showCurrentPassword}
              setShowCurrentPassword={state.setShowCurrentPassword}
              showNewPassword={state.showNewPassword}
              setShowNewPassword={state.setShowNewPassword}
              showConfirmPassword={state.showConfirmPassword}
              setShowConfirmPassword={state.setShowConfirmPassword}
            />
          )}
        </div>
      </div>

      <DeleteAccountModal
        isOpen={state.isDeleteModalOpen}
        onClose={() => state.setIsDeleteModalOpen(false)}
      />
    </div>
  );
};
