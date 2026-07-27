import type { ChecklistRule, OfficialSource, RouteRulePack } from '../../domain/types'

const verified = '2026-07-27'

const sources = {
  passport: {
    label: 'U.S. Department of State passport FAQ',
    url: 'https://travel.state.gov/en/passports/contact-support/faq.html',
  },
  passportRenewal: {
    label: 'USAGov passport renewal',
    url: 'https://www.usa.gov/renew-adult-passport',
  },
  residenceVisa: {
    label: 'German Missions in the U.S. residence visa',
    url: 'https://www.germany.info/us-en/service/visa/residence-visa-922288',
  },
  visaOverview: {
    label: 'German Missions in the U.S. visa information',
    url: 'https://www.germany.info/us-en/service/visa',
  },
  employmentVisa: {
    label: 'German Missions in the U.S. employment visa',
    url: 'https://www.germany.info/us-en/service/visa/employment-visa-922292',
  },
  studyVisa: {
    label: 'German Missions in the U.S. study visa',
    url: 'https://www.germany.info/us-en/service/visa/study-visa-916776',
  },
  familyVisa: {
    label: 'German Missions in the U.S. family reunion',
    url: 'https://www.germany.info/us-en/service/visa/family-reunion-922294',
  },
  makeItWork: {
    label: 'Make it in Germany work visa',
    url: 'https://www.make-it-in-germany.com/en/visa-residence/types/work-qualified-professionals',
  },
  health: {
    label: 'Make it in Germany health insurance',
    url: 'https://www.make-it-in-germany.com/en/living-in-germany/money-insurance/health-insurance',
  },
  registration: {
    label: 'German online residence registration service description',
    url: 'https://wohnsitzanmeldung.gov.de/service-description-643106',
  },
  landlord: {
    label: 'Bundesportal landlord confirmation',
    url: 'https://verwaltung.bund.de/leistungsverzeichnis/en/leistung/99115008000000/herausgeber/NW-121407334/region/050000000000',
  },
  taxId: {
    label: 'Federal Central Tax Office tax identification number',
    url: 'https://www.bzst.de/EN/Private_individuals/Tax_identification_number/tax_identification_number_node.html',
  },
  customs: {
    label: 'German Customs transferring residence',
    url: 'https://www.zoll.de/EN/Private-individuals/Staying-in-Germany/Transferring-residence/transferring-residence_node.html',
  },
  vehicleCustoms: {
    label: 'German Missions in the U.S. customs information',
    url: 'https://www.germany.info/us-en/moving-966174',
  },
  driving: {
    label: 'Federal Ministry of Transport foreign driving licences',
    url: 'https://www.bmv.de/SharedDocs/EN/Articles/StV/Roadtraffic/validity-foreign-driving-licences-in-germany.html',
  },
  usEmbassyDriving: {
    label: 'U.S. Embassy Germany driving in Germany',
    url: 'https://de.usembassy.gov/driving-in-germany/',
  },
  petsGermany: {
    label: 'Federal Ministry of Agriculture pet entry regulation',
    url: 'https://www.bmleh.de/EN/topics/animals/pets-and-zoo-animals/pets-entry-regulation.html',
  },
  petsEu: {
    label: 'EU travelling with pets and other animals',
    url: 'https://europa.eu/youreurope/citizens/travel/carry/pets-and-other-animals/index_en.htm',
  },
  petsUsda: {
    label: 'USDA APHIS pet travel from the United States to Germany',
    url: 'https://www.aphis.usda.gov/pet-travel/us-to-another-country-export/pet-travel-us-germany',
  },
  broadcast: {
    label: 'Rundfunkbeitrag information for students and apprentices',
    url: 'https://www.rundfunkbeitrag.de/welcome/english/students-and-apprentices',
  },
  irsAbroad: {
    label: 'IRS U.S. citizens and resident aliens abroad',
    url: 'https://www.irs.gov/individuals/international-taxpayers/us-citizens-and-resident-aliens-abroad',
  },
  irsFiling: {
    label: 'IRS filing requirements abroad',
    url: 'https://www.irs.gov/individuals/international-taxpayers/us-citizens-and-residents-abroad-filing-requirements',
  },
  publication54: {
    label: 'IRS Publication 54',
    url: 'https://www.irs.gov/forms-pubs/about-publication-54',
  },
  socialSecurity: {
    label: 'SSA international programs',
    url: 'https://www.ssa.gov/international/',
  },
  usEmbassyLiving: {
    label: 'U.S. Embassy Germany living and working in Germany',
    url: 'https://de.usembassy.gov/living-and-working-in-germany/',
  },
} satisfies Record<string, OfficialSource>

const always: ChecklistRule['appliesWhen'] = [{ field: 'always', operator: 'always', value: true }]

export const usToGermanyRulePack: RouteRulePack = {
  id: 'us-to-germany',
  origin: 'United States',
  destination: 'Germany',
  lastReviewed: verified,
  rules: [
    rule('passport-validity', 'Check passport validity', 'Review passport expiration dates for every traveler and renew early if validity is tight for travel, visa, or residence appointments.', 'before-departure', 10, -120, ['U.S. passport', 'Renewal receipt if pending'], [sources.passport, sources.passportRenewal], always, 'Everyone needs a valid passport for international travel. Some carriers or destinations may require extra validity beyond the trip dates.'),
    rule('visa-route', 'Determine visa or residence-permit route', 'Decide whether to apply before departure or after arrival, and confirm the route with the responsible German mission or local immigration authority.', 'before-departure', 20, -110, ['Passport', 'Purpose-specific documents', 'Proof of funds or employment'], [sources.residenceVisa, sources.visaOverview], [{ field: 'expectedStay', operator: 'equals', value: 'long' }], 'Applies because you expect to stay more than 90 days. U.S. citizens have route-specific options, but requirements depend on purpose and timing.'),
    rule('short-stay-rules', 'Review short-stay limits', 'Confirm that the planned stay fits within Schengen short-stay limits and does not accidentally require a residence pathway.', 'before-departure', 22, -90, ['Passport', 'Travel itinerary'], [sources.visaOverview], [{ field: 'expectedStay', operator: 'equals', value: 'short' }], 'Applies because you selected 90 days or less. Check current rules before relying on short-stay entry.'),
    rule('civil-documents', 'Gather civil-status documents', 'Collect birth, marriage, divorce, custody, or name-change records that may be needed for family, housing, school, or residence administration.', 'before-departure', 30, -100, ['Birth certificates', 'Marriage certificate', 'Divorce or custody documents', 'Certified translations if needed'], [sources.familyVisa, sources.usEmbassyLiving], always, 'This is useful for many move types and especially important when family members are moving.'),
    rule('health-coverage', 'Arrange appropriate health coverage', 'Choose travel, interim, statutory, or private coverage that matches your stay, work status, and residence process.', 'before-departure', 40, -75, ['Policy confirmation', 'Coverage dates', 'Employer or university insurance forms'], [sources.health], always, 'Germany generally requires health insurance, but the right arrangement depends on employment, study status, income, and residence route.'),
    rule('health-not-arranged', 'Prioritize health-insurance decisions', 'Make health coverage a near-term blocker and collect written proof before travel or appointments.', 'before-departure', 41, -60, ['Insurance quote or enrollment confirmation'], [sources.health], [{ field: 'healthInsurance', operator: 'in', value: ['not-arranged', 'unsure'] }], 'Applies because your health-insurance answer is not yet settled.'),
    rule('employment-proof', 'Prepare employment or income proof', 'Collect contracts, employer letters, pay information, remote-work documentation, or financial support evidence for onboarding and residence steps.', 'before-departure', 50, -70, ['Employment contract', 'Employer letter', 'Recent statements', 'Remote-work authorization'], [sources.employmentVisa, sources.makeItWork], [{ field: 'employment', operator: 'notEquals', value: 'not-working' }], 'Applies because you plan to work or have an employment arrangement.'),
    rule('study-proof', 'Prepare study documentation', 'Collect admission, enrollment, financing, housing, and insurance evidence for university onboarding and possible residence steps.', 'before-departure', 55, -70, ['Admission letter', 'Proof of funds', 'Insurance proof', 'Housing information'], [sources.studyVisa], [{ field: 'purpose', operator: 'equals', value: 'study' }], 'Applies because you selected study as your move purpose.'),
    rule('housing-docs', 'Prepare housing documentation', 'Collect lease, booking, host letter, and address details that may support registration, banking, insurance, and onboarding.', 'before-departure', 60, -45, ['Lease', 'Temporary booking', 'Host confirmation', 'Landlord contact details'], [sources.registration, sources.landlord], always, 'Housing documents are commonly needed soon after arrival.'),
    rule('temporary-accommodation', 'Arrange temporary accommodation', 'Book a realistic first address window if permanent housing is not secured, and confirm whether the accommodation can support local registration.', 'before-departure', 65, -45, ['Booking confirmation', 'Host or landlord details'], [sources.registration, sources.landlord], [{ field: 'housing', operator: 'notEquals', value: 'permanent' }], 'Applies because you have temporary housing or are still searching.'),
    rule('document-copies', 'Prepare digital and physical document copies', 'Make secure copies of key records for travel, appointments, housing, and backups.', 'before-departure', 70, -30, ['Passport copies', 'Insurance proof', 'Contracts', 'Civil documents'], [sources.usEmbassyLiving], always, 'Useful for all profiles; keep copies secure and avoid carrying unnecessary originals every day.'),
    rule('pet-entry', 'Review pet-entry requirements', 'Check microchip, vaccination, certificate, timing, airline, and arrival rules for each animal before booking travel.', 'before-departure', 80, -90, ['Vaccination record', 'Microchip record', 'Health certificate', 'Airline documents'], [sources.petsGermany, sources.petsEu, sources.petsUsda], [{ field: 'pets', operator: 'notEquals', value: 'none' }], 'Applies because you are bringing pets or other animals. Requirements vary by species and origin.'),
    rule('vehicle-import', 'Review vehicle import and driving requirements', 'Confirm customs, import, registration, insurance, and driver-license conversion steps before deciding to bring a vehicle.', 'before-departure', 90, -80, ['Vehicle title', 'Insurance records', 'Driver license', 'Shipping papers'], [sources.customs, sources.vehicleCustoms, sources.driving], [{ field: 'bringingVehicle', operator: 'equals', value: true }], 'Applies because you plan to bring a vehicle. Rules vary by vehicle, state license, and residence timing.'),
    rule('notify-us-institutions', 'Notify relevant U.S. institutions', 'Update banks, insurers, voter registration, tax contacts, subscriptions, and mail forwarding where appropriate.', 'before-departure', 100, -30, ['Account list', 'Forwarding address', 'Power of attorney if used'], [sources.irsAbroad, sources.usEmbassyLiving], always, 'This is organizational rather than universal legal advice; choose the institutions relevant to your situation.'),
    rule('relocation-budget', 'Prepare an initial relocation budget', 'Estimate first-month housing, deposits, insurance, transport, furnishings, appointments, document, tax, and emergency costs.', 'before-departure', 110, -60, ['Budget worksheet', 'Savings plan'], [sources.usEmbassyLiving], always, 'Useful for all movers because many costs arrive before local income or services are fully active.'),
    rule('money-access', 'Arrange access to money during the first weeks', 'Plan card access, cash needs, transfer methods, and backup payment options before your German bank setup is finished.', 'before-departure', 120, -20, ['Debit or credit cards', 'Bank travel notices', 'Transfer service details'], [sources.usEmbassyLiving], always, 'Useful for all profiles; avoid relying on one payment method.'),
    rule('confirm-travel', 'Confirm travel and accommodation', 'Recheck arrival transport, address, check-in timing, insurance dates, and emergency contacts.', 'pre-arrival', 10, -14, ['Tickets', 'Booking confirmation', 'Emergency contacts'], [sources.usEmbassyLiving], always),
    rule('registration-docs', 'Gather registration documents', 'Prepare passport, housing confirmation, civil documents where needed, and any city-specific forms for address registration.', 'pre-arrival', 20, -14, ['Passport', 'Wohnungsgeberbestätigung', 'Registration form if required'], [sources.registration, sources.landlord], [{ field: 'expectedStay', operator: 'equals', value: 'long' }], 'Applies because long stays commonly require local address registration after moving into housing.'),
    rule('landlord-confirmation', 'Prepare landlord-confirmation requirements', 'Ask whether your landlord, host, or temporary provider will issue the confirmation needed for address registration.', 'pre-arrival', 30, -10, ['Landlord confirmation', 'Lease or booking details'], [sources.landlord, sources.registration], always, 'This may apply once you move into registerable accommodation.'),
    rule('onboarding-docs', 'Prepare employer or university onboarding documents', 'Bundle tax, bank, insurance, identity, and authorization records requested by your employer or university.', 'pre-arrival', 40, -10, ['Passport', 'Contract or admission letter', 'Insurance proof', 'Bank details when available'], [sources.taxId, sources.health], [{ field: 'purpose', operator: 'in', value: ['employment', 'study'] }], 'Applies because you selected employment or study.'),
    rule('city-appointments', 'Review destination-city appointment systems', 'Check how your destination city handles registration and immigration appointments, including online booking windows.', 'pre-arrival', 50, -14, ['Destination city name', 'Address details'], [sources.registration], always, 'Municipal procedures vary. Use your city name to find the responsible local office.'),
    rule('family-docs', 'Prepare family-related documents', 'Prepare school, childcare, custody, vaccination, marriage, and birth records that family members may need after arrival.', 'pre-arrival', 60, -21, ['Birth certificates', 'School records', 'Vaccination records', 'Custody documents'], [sources.familyVisa, sources.usEmbassyLiving], [{ field: 'movingWith', operator: 'in', value: ['partner', 'family'] }], 'Applies because you are moving with a partner or family.'),
    rule('address-registration', 'Register the residential address where applicable', 'After moving into accommodation, complete address registration with the local authority as soon as possible and keep the confirmation.', 'first-week', 10, 3, ['Passport', 'Housing confirmation', 'Registration form if required'], [sources.registration, sources.landlord], [{ field: 'expectedStay', operator: 'equals', value: 'long' }], 'Applies because you expect a long stay. Registration timing and appointment availability are local.'),
    rule('tax-id', 'Obtain or await tax identification information', 'Watch for the tax identification number after registration, and know how to request it again if it does not arrive or is lost.', 'first-week', 20, 7, ['Registration confirmation', 'Mailbox access'], [sources.taxId], [{ field: 'expectedStay', operator: 'equals', value: 'long' }], 'Applies because long stays often involve taxable activity, payroll, banking, or administration.'),
    rule('first-week-onboarding', 'Complete employer or university onboarding', 'Submit documents requested by your employer or university, and ask what can be pending while tax ID or bank details arrive.', 'first-week', 30, 5, ['Contract or admission letter', 'Insurance proof', 'Tax ID when available'], [sources.employmentVisa, sources.studyVisa, sources.taxId], [{ field: 'purpose', operator: 'in', value: ['employment', 'study'] }]),
    rule('activate-health', 'Activate or finalize health insurance', 'Confirm the coverage start date, membership certificate, payment setup, and documents needed by employer, university, or immigration office.', 'first-week', 40, 5, ['Insurance certificate', 'Employer or university forms'], [sources.health], always),
    rule('communications', 'Set up essential communications', 'Arrange mobile service and reliable access to email, maps, banking, and appointment portals.', 'first-week', 50, 4, ['Passport or ID if required by provider', 'Payment method'], [sources.usEmbassyLiving], always),
    rule('bank-account', 'Open or prepare a German bank account', 'Decide whether you need a German IBAN for rent, payroll, utilities, insurance, or broadcasting contribution, and prepare identification documents.', 'first-week', 60, 10, ['Passport', 'Address confirmation if required', 'Tax ID when available'], [sources.taxId, sources.usEmbassyLiving], always),
    rule('transport-options', 'Review local public-transport options', 'Check local transit passes, bike options, employer or student tickets, and first-week routes to appointments.', 'first-week', 70, 5, ['Destination city', 'Employer or student eligibility'], [sources.usEmbassyLiving], always),
    rule('residence-permit-application', 'Apply for or complete residence-permit steps', 'Schedule or attend local immigration steps if your route requires post-arrival residence administration.', 'first-month', 10, 21, ['Passport', 'Biometric photo', 'Proof of purpose', 'Insurance proof', 'Housing confirmation'], [sources.residenceVisa, sources.employmentVisa, sources.studyVisa, sources.familyVisa], [{ field: 'expectedStay', operator: 'equals', value: 'long' }], 'Applies because you expect to stay more than 90 days. Requirements vary by route and local authority.'),
    rule('visa-approved-followup', 'Store approval and permit-expiration records', 'If your visa or residence status is already approved, record validity dates and any local follow-up obligations.', 'first-month', 11, 14, ['Visa or residence approval', 'Appointment notices'], [sources.residenceVisa], [{ field: 'visaStatus', operator: 'equals', value: 'approved' }], 'Applies because you selected already approved. Keep proof accessible and track expiration.'),
    rule('payroll-tax-details', 'Confirm payroll and tax details', 'Confirm tax ID, tax class questions, social insurance deductions, and pay-date setup with the employer when applicable.', 'first-month', 20, 21, ['Tax ID', 'Bank details', 'Employer forms'], [sources.taxId, sources.socialSecurity], [{ field: 'employment', operator: 'equals', value: 'german-employer' }]),
    rule('confirm-health-enrollment', 'Confirm health-insurance enrollment', 'Check that insurance enrollment is active and that employer, university, or immigration records match the policy.', 'first-month', 30, 21, ['Membership certificate', 'Policy documents'], [sources.health], always),
    rule('housing-utilities', 'Complete housing and utility setup', 'Finalize lease records, utilities, internet, deposit documentation, and address updates after moving into longer-term housing.', 'first-month', 40, 24, ['Lease', 'Deposit receipt', 'Meter readings', 'Address records'], [sources.registration, sources.landlord], always),
    rule('broadcasting-contribution', 'Review broadcasting-contribution obligations', 'Watch for broadcasting contribution correspondence and confirm whether you need to register, pay, or link to an existing household account.', 'first-month', 50, 30, ['Registration confirmation', 'Household contribution number if applicable'], [sources.broadcast], [{ field: 'expectedStay', operator: 'equals', value: 'long' }], 'Applies because long-term residents commonly receive related correspondence. Check current official guidance.'),
    rule('driver-license-conversion', 'Review driver-license conversion requirements', 'If you will drive after arrival, check how long your U.S. license is valid and whether your state has conversion rules.', 'first-month', 60, 25, ['U.S. driver license', 'International Driving Permit if used', 'Residence registration'], [sources.driving, sources.usEmbassyDriving], [{ field: 'bringingVehicle', operator: 'equals', value: true }], 'Applies because you are bringing a vehicle. Also review this if you plan to drive rentals or car-share vehicles.'),
    rule('local-pet-registration', 'Register pets locally where applicable', 'Check municipal dog tax, local animal rules, insurance expectations, and veterinarian setup for your destination city.', 'first-month', 70, 25, ['Pet documents', 'Address registration', 'Microchip record'], [sources.petsGermany, sources.petsEu], [{ field: 'pets', operator: 'notEquals', value: 'none' }], 'Applies because you are bringing animals. Local obligations vary by city and animal type.'),
    rule('childcare-school', 'Arrange childcare or school steps', 'Contact local schools, childcare providers, or municipal offices and prepare translated records where needed.', 'first-month', 80, 20, ['School records', 'Birth certificates', 'Vaccination records', 'Address confirmation'], [sources.familyVisa, sources.usEmbassyLiving], [{ field: 'movingWith', operator: 'equals', value: 'family' }]),
    rule('tax-residency', 'Review tax-residency implications', 'Discuss U.S. and German tax residence, payroll, filing, treaty, and reporting questions with qualified advisers if your situation is complex.', 'first-three-months', 10, 60, ['Income records', 'Move date records', 'Payroll records'], [sources.irsAbroad, sources.publication54], always, 'This is not tax advice; use it as a prompt to confirm obligations.'),
    rule('us-filing', 'Review U.S. filing obligations while abroad', 'Track U.S. filing requirements, foreign-earned-income or credit questions, account reporting, and deadlines.', 'first-three-months', 20, 75, ['Income records', 'Foreign account records', 'Prior returns'], [sources.irsAbroad, sources.irsFiling, sources.publication54], always),
    rule('long-term-insurance', 'Confirm long-term insurance needs', 'Review liability, household, disability, vehicle, pet, travel, and family insurance needs after your temporary setup stabilizes.', 'first-three-months', 30, 70, ['Current policies', 'Lease', 'Vehicle or pet records'], [sources.health, sources.usEmbassyLiving], always),
    rule('pension-social-records', 'Review pension or social-security records', 'Keep records of German social insurance and U.S. Social Security history, especially for cross-border employment.', 'first-three-months', 40, 80, ['Payslips', 'Social insurance number if issued', 'SSA records'], [sources.socialSecurity], [{ field: 'employment', operator: 'notEquals', value: 'not-working' }]),
    rule('remaining-residence-admin', 'Complete remaining residence administration', 'Follow up on outstanding immigration, address, tax, bank, insurance, or document requests before temporary windows expire.', 'first-three-months', 50, 85, ['Appointment receipts', 'Open document requests'], [sources.residenceVisa, sources.registration], [{ field: 'expectedStay', operator: 'equals', value: 'long' }]),
    rule('replace-temporary-services', 'Replace temporary arrangements with long-term services', 'Convert temporary housing, insurance, phone, banking, transport, storage, or mail arrangements into durable services.', 'first-three-months', 60, 90, ['Temporary contracts', 'Cancellation dates', 'Long-term contracts'], [sources.usEmbassyLiving], always),
    rule('track-residence-expiration', 'Track residence-permit expiration', 'Record expiration dates, renewal windows, appointment evidence, and document refresh needs.', 'ongoing', 10, undefined, ['Residence card or visa', 'Calendar reminder'], [sources.residenceVisa], [{ field: 'expectedStay', operator: 'equals', value: 'long' }]),
    rule('track-passport-expiration', 'Track passport expiration', 'Keep passport renewal timing visible for every traveler, especially before booking travel or renewing residence documents.', 'ongoing', 20, undefined, ['Passport', 'Calendar reminder'], [sources.passport, sources.passportRenewal], always),
    rule('health-records', 'Keep health-insurance records', 'Store membership certificates, payment records, claims correspondence, and coverage changes.', 'ongoing', 30, undefined, ['Insurance records'], [sources.health], always),
    rule('address-records', 'Keep address records current', 'Update local registration, banks, insurers, employer, university, and U.S. contacts when your address changes.', 'ongoing', 40, undefined, ['Registration confirmations', 'Address list'], [sources.registration, sources.irsAbroad], always),
    rule('employment-tax-documents', 'Maintain employment and tax documents', 'Retain payslips, annual wage statements, contracts, invoices, and tax correspondence in both digital and physical backups.', 'ongoing', 50, undefined, ['Payslips', 'Tax notices', 'Contracts'], [sources.taxId, sources.irsAbroad], always),
    rule('annual-tax-review', 'Review annual U.S. and German tax obligations', 'Set an annual reminder to review U.S. and German filing duties, extensions, treaty questions, and account reporting.', 'ongoing', 60, undefined, ['Income records', 'Bank records', 'Tax adviser notes'], [sources.irsFiling, sources.publication54], always),
    rule('ongoing-family-obligations', 'Review recurring family obligations', 'Track school, childcare, residence, insurance, and document renewal dates for accompanying family members.', 'ongoing', 70, undefined, ['School records', 'Insurance records', 'Civil documents'], [sources.familyVisa, sources.usEmbassyLiving], [{ field: 'movingWith', operator: 'notEquals', value: 'alone' }]),
    rule('ongoing-pet-obligations', 'Review recurring pet obligations', 'Track local registration, vaccination, insurance, veterinary, and travel-record renewals for animals.', 'ongoing', 80, undefined, ['Pet records', 'Veterinary records'], [sources.petsGermany, sources.petsEu], [{ field: 'pets', operator: 'notEquals', value: 'none' }]),
    rule('ongoing-vehicle-obligations', 'Review recurring vehicle obligations', 'Track driver-license conversion, vehicle registration, inspection, customs, insurance, and parking obligations.', 'ongoing', 90, undefined, ['Vehicle records', 'Driver license', 'Insurance records'], [sources.driving, sources.vehicleCustoms], [{ field: 'bringingVehicle', operator: 'equals', value: true }]),
  ],
}

function rule(
  id: string,
  title: string,
  description: string,
  category: ChecklistRule['category'],
  order: number,
  offsetDays: number | undefined,
  documents: string[],
  officialSources: OfficialSource[],
  appliesWhen: ChecklistRule['appliesWhen'],
  applicabilityNote?: string,
  details?: string,
): ChecklistRule {
  return {
    id,
    title,
    description,
    category,
    order,
    appliesWhen: [...appliesWhen],
    dueDate: offsetDays === undefined ? undefined : { relativeTo: 'arrival', offsetDays },
    documents,
    officialSources,
    applicabilityNote,
    details,
    lastVerified: verified,
  }
}
