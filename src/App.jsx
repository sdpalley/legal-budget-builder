/* eslint-disable react-refresh/only-export-components -- helpers stay here until the tested domain extraction batch */
import { useState, useEffect, useRef } from "react";

// ── Phase Library ─────────────────────────────────────────────────────────────

const LIBRARY = {
  arbitration: [
    { id:"p1", name:"Pre-Filing", tasks:[
      { id:"t1", name:"Draft and file claim", note:"" },
      { id:"t2", name:"Respond to motion to dismiss or stay", note:"if any" },
    ]},
    { id:"p2", name:"Case Management", tasks:[
      { id:"t3", name:"Initial case conference", note:"" },
      { id:"t4", name:"Scheduling matters", note:"" },
    ]},
    { id:"p3", name:"Discovery", tasks:[
      { id:"t5", name:"Written discovery", note:"scope and ESI variability" },
      { id:"t6", name:"Document review", note:"" },
      { id:"t7", name:"Depositions", note:"number and time dependent" },
    ]},
    { id:"p4", name:"Motions", tasks:[
      { id:"t8", name:"Dispositive motions", note:"if any" },
      { id:"t9", name:"Motions in limine", note:"if any" },
    ]},
    { id:"p5", name:"Pre-Hearing", tasks:[
      { id:"t10", name:"Pre-hearing briefs", note:"" },
      { id:"t11", name:"Exchange witness lists", note:"" },
      { id:"t12", name:"Exchange documentary evidence", note:"" },
      { id:"t13", name:"Stipulation of undisputed facts", note:"" },
      { id:"t14", name:"Pre-hearing management conference", note:"" },
    ]},
    { id:"p6", name:"Hearing", tasks:[
      { id:"t15", name:"Witness preparation", note:"" },
      { id:"t16", name:"Evidentiary hearing", note:"" },
    ]},
    { id:"p7", name:"Post-Hearing", tasks:[
      { id:"t17", name:"Post-hearing briefs", note:"if any" },
      { id:"t18", name:"Award enforcement", note:"if necessary" },
    ]},
  ],
  federal: [
    { id:"p1", name:"Pre-Filing", tasks:[
      { id:"t1", name:"Draft and file complaint", note:"" },
      { id:"t2", name:"Pre-litigation demand / tolling agreement", note:"if applicable" },
    ]},
    { id:"p2", name:"Pleadings", tasks:[
      { id:"t3", name:"Respond to motion to dismiss", note:"if filed" },
      { id:"t4", name:"Answer and affirmative defenses", note:"" },
    ]},
    { id:"p3", name:"Case Management", tasks:[
      { id:"t5", name:"Rule 26(f) conference and scheduling order", note:"" },
      { id:"t6", name:"Initial disclosures", note:"" },
    ]},
    { id:"p4", name:"Discovery", tasks:[
      { id:"t7", name:"Written discovery", note:"interrogatories, RFPs, RFAs" },
      { id:"t8", name:"Document review and production", note:"ESI variability" },
      { id:"t9", name:"Fact depositions", note:"" },
      { id:"t10", name:"Expert discovery", note:"if applicable" },
      { id:"t11", name:"Discovery motions", note:"if any" },
    ]},
    { id:"p5", name:"Motions", tasks:[
      { id:"t12", name:"Summary judgment briefing", note:"if filed" },
      { id:"t13", name:"Daubert motions", note:"if applicable" },
      { id:"t14", name:"Motions in limine", note:"" },
    ]},
    { id:"p6", name:"Pre-Trial", tasks:[
      { id:"t15", name:"Pre-trial briefs and submissions", note:"" },
      { id:"t16", name:"Jury instructions", note:"if jury trial" },
      { id:"t17", name:"Exhibit and witness preparation", note:"" },
    ]},
    { id:"p7", name:"Trial", tasks:[
      { id:"t18", name:"Trial (per day estimate)", note:"" },
    ]},
    { id:"p8", name:"Post-Trial", tasks:[
      { id:"t19", name:"Post-trial motions", note:"if any" },
      { id:"t20", name:"Appeal", note:"if applicable" },
    ]},
  ],
  state: [
    { id:"p1", name:"Pre-Filing", tasks:[
      { id:"t1", name:"Draft and file complaint", note:"" },
      { id:"t2", name:"Service of process", note:"" },
    ]},
    { id:"p2", name:"Pleadings", tasks:[
      { id:"t3", name:"Respond to demurrer or motion to dismiss", note:"if filed" },
      { id:"t4", name:"Answer and affirmative defenses", note:"" },
    ]},
    { id:"p3", name:"Discovery", tasks:[
      { id:"t5", name:"Written discovery", note:"" },
      { id:"t6", name:"Document review and production", note:"" },
      { id:"t7", name:"Depositions", note:"" },
      { id:"t8", name:"Discovery motions", note:"if any" },
    ]},
    { id:"p4", name:"Motions", tasks:[
      { id:"t9", name:"Summary judgment / adjudication", note:"if filed" },
      { id:"t10", name:"Motions in limine", note:"" },
    ]},
    { id:"p5", name:"Pre-Trial", tasks:[
      { id:"t11", name:"Pre-trial conference and submissions", note:"" },
      { id:"t12", name:"Exhibit and witness preparation", note:"" },
    ]},
    { id:"p6", name:"Trial", tasks:[
      { id:"t13", name:"Trial (per day estimate)", note:"" },
    ]},
  ],
  regulatory: [
    { id:"p1", name:"Investigation / Pre-Charge", tasks:[
      { id:"t1", name:"Document preservation and collection", note:"" },
      { id:"t2", name:"Respond to subpoena or CID", note:"if issued" },
      { id:"t3", name:"Internal investigation", note:"" },
      { id:"t4", name:"Witness interviews", note:"" },
    ]},
    { id:"p2", name:"Agency Proceedings", tasks:[
      { id:"t5", name:"Wells submission or pre-charge response", note:"if applicable" },
      { id:"t6", name:"Negotiation with agency", note:"" },
      { id:"t7", name:"Settlement / consent order negotiation", note:"" },
    ]},
    { id:"p3", name:"Enforcement / Litigation", tasks:[
      { id:"t8", name:"Administrative hearing preparation", note:"" },
      { id:"t9", name:"Administrative hearing", note:"" },
      { id:"t10", name:"Judicial review / appeal", note:"if applicable" },
    ]},
    { id:"p4", name:"Compliance / Remediation", tasks:[
      { id:"t11", name:"Compliance program review", note:"" },
      { id:"t12", name:"Monitor coordination", note:"if applicable" },
    ]},
  ],
};

const FEDERAL_COURTS = [
  { circuit: "D.C. Circuit",      courts: ["D.D.C."] },
  { circuit: "First Circuit",     courts: ["D. Me.","D. Mass.","D.N.H.","D.P.R.","D.R.I."] },
  { circuit: "Second Circuit",    courts: ["D. Conn.","E.D.N.Y.","N.D.N.Y.","S.D.N.Y.","W.D.N.Y.","D. Vt."] },
  { circuit: "Third Circuit",     courts: ["D. Del.","D.N.J.","E.D. Pa.","M.D. Pa.","W.D. Pa.","D.V.I."] },
  { circuit: "Fourth Circuit",    courts: ["D. Md.","E.D.N.C.","M.D.N.C.","W.D.N.C.","D.S.C.","E.D. Va.","W.D. Va.","N.D.W. Va.","S.D.W. Va."] },
  { circuit: "Fifth Circuit",     courts: ["E.D. La.","M.D. La.","W.D. La.","N.D. Miss.","S.D. Miss.","E.D. Tex.","N.D. Tex.","S.D. Tex.","W.D. Tex."] },
  { circuit: "Sixth Circuit",     courts: ["E.D. Ky.","W.D. Ky.","E.D. Mich.","W.D. Mich.","N.D. Ohio","S.D. Ohio","E.D. Tenn.","M.D. Tenn.","W.D. Tenn."] },
  { circuit: "Seventh Circuit",   courts: ["C.D. Ill.","N.D. Ill.","S.D. Ill.","N.D. Ind.","S.D. Ind.","E.D. Wis.","W.D. Wis."] },
  { circuit: "Eighth Circuit",    courts: ["E.D. Ark.","W.D. Ark.","N.D. Iowa","S.D. Iowa","D. Minn.","E.D. Mo.","W.D. Mo.","D. Neb.","D.N.D.","D.S.D."] },
  { circuit: "Ninth Circuit",     courts: ["D. Alaska","D. Ariz.","C.D. Cal.","E.D. Cal.","N.D. Cal.","S.D. Cal.","D. Guam","D. Haw.","D. Idaho","D. Mont.","D. Nev.","D.N. Mar. I.","D. Or.","E.D. Wash.","W.D. Wash."] },
  { circuit: "Tenth Circuit",     courts: ["D. Colo.","D. Kan.","D.N.M.","E.D. Okla.","N.D. Okla.","W.D. Okla.","D. Utah","D. Wyo."] },
  { circuit: "Eleventh Circuit",  courts: ["M.D. Ala.","N.D. Ala.","S.D. Ala.","M.D. Fla.","N.D. Fla.","S.D. Fla.","M.D. Ga.","N.D. Ga.","S.D. Ga."] },
  { circuit: "Courts of Appeals", courts: ["1st Cir.","2d Cir.","3d Cir.","4th Cir.","5th Cir.","6th Cir.","7th Cir.","8th Cir.","9th Cir.","10th Cir.","11th Cir.","D.C. Cir.","Fed. Cir."] },
  { circuit: "Specialty Courts",  courts: ["U.S. Ct. of Federal Claims","U.S. Ct. of Int'l Trade","U.S. Tax Court","U.S. Ct. of App. for Veterans Claims"] },
];

const STATE_COURTS = [
  { state: "Alabama",        courts: ["Circuit Court","District Court","Court of Civil Appeals","Supreme Court of Alabama"] },
  { state: "Alaska",         courts: ["Superior Court","District Court","Supreme Court of Alaska"] },
  { state: "Arizona",        courts: ["Superior Court – Maricopa County","Superior Court – Pima County","Superior Court – Other County","Court of Appeals","Supreme Court of Arizona"] },
  { state: "Arkansas",       courts: ["Circuit Court","Court of Appeals","Supreme Court of Arkansas"] },
  { state: "California",     courts: ["Superior Court – Los Angeles County","Superior Court – San Francisco County","Superior Court – San Diego County","Superior Court – Orange County","Superior Court – Santa Clara County","Superior Court – Sacramento County","Superior Court – Alameda County","Superior Court – Other County","Court of Appeal","Supreme Court of California"] },
  { state: "Colorado",       courts: ["District Court – Denver","District Court – El Paso County","District Court – Other County","Court of Appeals","Supreme Court of Colorado"] },
  { state: "Connecticut",    courts: ["Superior Court – Hartford J.D.","Superior Court – Fairfield J.D.","Superior Court – New Haven J.D.","Superior Court – Other J.D.","Appellate Court","Supreme Court of Connecticut"] },
  { state: "Delaware",       courts: ["Court of Chancery","Superior Court","Court of Common Pleas","Supreme Court of Delaware"] },
  { state: "Florida",        courts: ["Circuit Court – Miami-Dade County","Circuit Court – Broward County","Circuit Court – Palm Beach County","Circuit Court – Orange County","Circuit Court – Hillsborough County","Circuit Court – Other County","District Court of Appeal","Supreme Court of Florida"] },
  { state: "Georgia",        courts: ["Superior Court – Fulton County","Superior Court – Gwinnett County","Superior Court – Other County","Court of Appeals","Supreme Court of Georgia"] },
  { state: "Hawaii",         courts: ["Circuit Court – First Circuit (Honolulu)","Circuit Court – Other Circuit","Intermediate Court of Appeals","Supreme Court of Hawaii"] },
  { state: "Idaho",          courts: ["District Court","Court of Appeals","Supreme Court of Idaho"] },
  { state: "Illinois",       courts: ["Circuit Court – Cook County (Chicago)","Circuit Court – DuPage County","Circuit Court – Lake County","Circuit Court – Other County","Appellate Court","Supreme Court of Illinois"] },
  { state: "Indiana",        courts: ["Circuit Court","Superior Court","Court of Appeals","Supreme Court of Indiana"] },
  { state: "Iowa",           courts: ["District Court","Court of Appeals","Supreme Court of Iowa"] },
  { state: "Kansas",         courts: ["District Court – Johnson County","District Court – Sedgwick County","District Court – Other County","Court of Appeals","Supreme Court of Kansas"] },
  { state: "Kentucky",       courts: ["Circuit Court – Jefferson County","Circuit Court – Fayette County","Circuit Court – Other County","Court of Appeals","Supreme Court of Kentucky"] },
  { state: "Louisiana",      courts: ["District Court – Orleans Parish","District Court – East Baton Rouge Parish","District Court – Jefferson Parish","District Court – Other Parish","Court of Appeal","Supreme Court of Louisiana"] },
  { state: "Maine",          courts: ["Superior Court","District Court","Law Court (Supreme Judicial Court)"] },
  { state: "Maryland",       courts: ["Circuit Court – Baltimore City","Circuit Court – Montgomery County","Circuit Court – Prince George's County","Circuit Court – Other County","Appellate Court","Supreme Court of Maryland"] },
  { state: "Massachusetts",  courts: ["Superior Court – Suffolk County (Boston)","Superior Court – Middlesex County","Superior Court – Norfolk County","Superior Court – Other County","Business Litigation Session (BLS)","Appeals Court","Supreme Judicial Court"] },
  { state: "Michigan",       courts: ["Circuit Court – Wayne County","Circuit Court – Oakland County","Circuit Court – Kent County","Circuit Court – Other County","Court of Appeals","Supreme Court of Michigan"] },
  { state: "Minnesota",      courts: ["District Court – Hennepin County","District Court – Ramsey County","District Court – Other County","Court of Appeals","Supreme Court of Minnesota"] },
  { state: "Mississippi",    courts: ["Circuit Court","Chancery Court","Court of Appeals","Supreme Court of Mississippi"] },
  { state: "Missouri",       courts: ["Circuit Court – Jackson County","Circuit Court – St. Louis City","Circuit Court – St. Louis County","Circuit Court – Other County","Court of Appeals","Supreme Court of Missouri"] },
  { state: "Montana",        courts: ["District Court","Supreme Court of Montana"] },
  { state: "Nebraska",       courts: ["District Court – Douglas County","District Court – Lancaster County","District Court – Other County","Court of Appeals","Supreme Court of Nebraska"] },
  { state: "Nevada",         courts: ["District Court – Clark County (Las Vegas)","District Court – Washoe County (Reno)","District Court – Other County","Supreme Court of Nevada"] },
  { state: "New Hampshire",  courts: ["Superior Court","Supreme Court of New Hampshire"] },
  { state: "New Jersey",     courts: ["Superior Court – Law Division (Bergen County)","Superior Court – Law Division (Essex County)","Superior Court – Law Division (Hudson County)","Superior Court – Law Division (Middlesex County)","Superior Court – Law Division (Other County)","Superior Court – Chancery Division","Appellate Division","Supreme Court of New Jersey"] },
  { state: "New Mexico",     courts: ["District Court – Bernalillo County","District Court – Other County","Court of Appeals","Supreme Court of New Mexico"] },
  { state: "New York",       courts: ["Supreme Court – New York County (Manhattan)","Supreme Court – Kings County (Brooklyn)","Supreme Court – Queens County","Supreme Court – Bronx County","Supreme Court – Richmond County (Staten Island)","Supreme Court – Nassau County","Supreme Court – Suffolk County","Supreme Court – Westchester County","Supreme Court – Erie County (Buffalo)","Supreme Court – Other County","Commercial Division – New York County","Commercial Division – Kings County","Commercial Division – Other County","Appellate Division – 1st Dept.","Appellate Division – 2d Dept.","Appellate Division – 3d Dept.","Appellate Division – 4th Dept.","Court of Appeals of New York"] },
  { state: "North Carolina",  courts: ["Superior Court – Wake County","Superior Court – Mecklenburg County","Superior Court – Other County","Business Court","Court of Appeals","Supreme Court of North Carolina"] },
  { state: "North Dakota",   courts: ["District Court","Supreme Court of North Dakota"] },
  { state: "Ohio",           courts: ["Court of Common Pleas – Cuyahoga County","Court of Common Pleas – Franklin County","Court of Common Pleas – Hamilton County","Court of Common Pleas – Summit County","Court of Common Pleas – Other County","Court of Appeals","Supreme Court of Ohio"] },
  { state: "Oklahoma",       courts: ["District Court – Oklahoma County","District Court – Tulsa County","District Court – Other County","Court of Civil Appeals","Supreme Court of Oklahoma"] },
  { state: "Oregon",         courts: ["Circuit Court – Multnomah County","Circuit Court – Washington County","Circuit Court – Lane County","Circuit Court – Other County","Court of Appeals","Supreme Court of Oregon"] },
  { state: "Pennsylvania",   courts: ["Court of Common Pleas – Philadelphia County","Court of Common Pleas – Allegheny County","Court of Common Pleas – Montgomery County","Court of Common Pleas – Other County","Commonwealth Court","Superior Court","Supreme Court of Pennsylvania"] },
  { state: "Rhode Island",   courts: ["Superior Court","Supreme Court of Rhode Island"] },
  { state: "South Carolina", courts: ["Circuit Court","Court of Appeals","Supreme Court of South Carolina"] },
  { state: "South Dakota",   courts: ["Circuit Court","Supreme Court of South Dakota"] },
  { state: "Tennessee",      courts: ["Circuit Court – Shelby County","Circuit Court – Davidson County","Circuit Court – Other County","Chancery Court","Court of Appeals","Supreme Court of Tennessee"] },
  { state: "Texas",          courts: ["District Court – Harris County (Houston)","District Court – Dallas County","District Court – Bexar County (San Antonio)","District Court – Travis County (Austin)","District Court – Tarrant County (Fort Worth)","District Court – Other County","Court of Appeals","Supreme Court of Texas","Court of Criminal Appeals"] },
  { state: "Utah",           courts: ["District Court – Salt Lake County","District Court – Utah County","District Court – Other County","Court of Appeals","Supreme Court of Utah"] },
  { state: "Vermont",        courts: ["Superior Court","Supreme Court of Vermont"] },
  { state: "Virginia",       courts: ["Circuit Court – Fairfax County","Circuit Court – City of Richmond","Circuit Court – Arlington County","Circuit Court – City of Virginia Beach","Circuit Court – Other","Court of Appeals","Supreme Court of Virginia"] },
  { state: "Washington",     courts: ["Superior Court – King County (Seattle)","Superior Court – Pierce County","Superior Court – Snohomish County","Superior Court – Other County","Court of Appeals","Supreme Court of Washington"] },
  { state: "West Virginia",  courts: ["Circuit Court","Intermediate Court of Appeals","Supreme Court of Appeals"] },
  { state: "Wisconsin",      courts: ["Circuit Court – Milwaukee County","Circuit Court – Dane County","Circuit Court – Other County","Court of Appeals","Supreme Court of Wisconsin"] },
  { state: "Wyoming",        courts: ["District Court","Supreme Court of Wyoming"] },
  { state: "Washington D.C.", courts: ["D.C. Superior Court","D.C. Court of Appeals"] },
];

const ARBITRATION_FORA = [
  { provider: "AAA – American Arbitration Association", forums: ["AAA – Commercial Arbitration Rules","AAA – Employment Arbitration Rules","AAA – Construction Industry Rules","AAA – Consumer Arbitration Rules","AAA – Large Complex Commercial Disputes"] },
  { provider: "JAMS",                                    forums: ["JAMS – Comprehensive Arbitration Rules","JAMS – Streamlined Arbitration Rules","JAMS – Employment Arbitration Rules","JAMS – Class Action Procedures","JAMS – International Arbitration Rules"] },
  { provider: "ICC / ICDR",                              forums: ["ICC International Court of Arbitration","ICDR – International Centre for Dispute Resolution"] },
  { provider: "International Forums",                    forums: ["LCIA – London Court of International Arbitration","SIAC – Singapore International Arbitration Centre","HKIAC – Hong Kong International Arbitration Centre","ICSID – World Bank Centre","SCC – Stockholm Chamber of Commerce","VIAC – Vienna International Arbitral Centre","UNCITRAL Rules (Ad Hoc)"] },
  { provider: "Specialized / Domestic",                  forums: ["CPR – Institute for Conflict Prevention & Resolution","NAM – National Arbitration and Mediation","FINRA Dispute Resolution (Securities)","AAA – Wireless Industry Arbitration","AHLA – American Health Law Association","Ad Hoc Arbitration"] },
];

const REGULATORY_FORA = [
  { agency: "Department of Justice (DOJ)", bodies: ["DOJ – Antitrust Division","DOJ – Civil Division","DOJ – Civil Rights Division","DOJ – Criminal Division","DOJ – Environment & Natural Resources","DOJ – Tax Division","DOJ – U.S. Attorney's Office"] },
  { agency: "Securities & Financial Regulators", bodies: ["SEC – Division of Enforcement","SEC – Division of Examination","CFTC – Division of Enforcement","FINRA – Department of Enforcement","OCC – Enforcement Actions","FDIC – Enforcement Actions","Federal Reserve – Enforcement","CFPB – Enforcement"] },
  { agency: "Federal Trade Commission (FTC)", bodies: ["FTC – Bureau of Consumer Protection","FTC – Bureau of Competition","FTC – Merger Review (HSR)"] },
  { agency: "Environmental / Health / Safety", bodies: ["EPA – Office of Civil Enforcement","EPA – Criminal Investigation Division","OSHA – Enforcement","FDA – Office of Criminal Investigations","FDA – Office of Compliance","HHS – Office of Inspector General","CMS – Enforcement"] },
  { agency: "Communications / Energy / Transport", bodies: ["FCC – Enforcement Bureau","FERC – Office of Enforcement","DOT – Office of Aviation Enforcement","FAA – Enforcement","STB – Surface Transportation Board","PHMSA – Pipeline & Hazardous Materials"] },
  { agency: "Labor & Employment Agencies", bodies: ["EEOC – Charge / Litigation","NLRB – Unfair Labor Practice","DOL – Wage & Hour Division","DOL – OFCCP","MSPB – Merit Systems Protection"] },
  { agency: "State Attorneys General", bodies: ["State AG – Antitrust","State AG – Consumer Protection","State AG – Environmental","State AG – Insurance Fraud","State AG – Securities","Multi-State AG Investigation"] },
  { agency: "State Regulatory Bodies", bodies: ["State Banking / Financial Regulator","State Insurance Commissioner","State Public Utilities Commission","State Environmental Agency","State Health Department","State Liquor Control Board","Other State Agency"] },
  { agency: "Administrative Adjudication", bodies: ["ALJ Proceeding – Federal Agency","ALJ Proceeding – State Agency","CFTC Reparations Proceeding","ITC – Section 337 Investigation","PTAB – Inter Partes Review","TTAB – Trademark Trial & Appeal"] },
];

const DEFAULT_CAVEATS = [
  "This estimate does not include fees for the arbitrator, judge, or any court, filing, or administrative costs.",
  "Expert witness and consultant fees are not included and should be budgeted separately.",
  "This budget is an estimate only. Actual costs may vary depending on matter complexity, opposing party's litigation posture, and unforeseen developments.",
  "This estimate does not account for any parallel or ancillary proceedings in other jurisdictions.",
  "Rate escalation over the course of the engagement is not reflected in this estimate.",
];

const MATTER_LABELS = { arbitration:"Arbitration", federal:"Federal Civil Litigation", state:"State Civil Litigation", regulatory:"Regulatory / Enforcement" };

const CORP_MATTER_LABELS = {
  ma_strategic:         "M&A – Strategic Acquisition / Sale",
  ma_pe:                "M&A – Private Equity / LBO",
  vc_growth:            "Venture Capital / Growth Equity",
  capital_markets_ipo:  "Capital Markets – IPO",
  capital_markets_debt: "Capital Markets – Debt Offering",
  private_placement:    "Private Placement",
  real_estate_acq:      "Real Estate – Acquisition / Disposition",
  real_estate_finance:  "Real Estate – Finance / Mortgage",
  commercial_lending:   "Commercial Lending / Credit Facility",
  joint_venture:        "Joint Venture",
  licensing_ip:         "Licensing / IP Transaction",
  restructuring:        "Restructuring / Bankruptcy",
};

const CORP_LIBRARY = {
  ma_strategic: [
    { id:"p1", name:"Pre-Deal & Preliminary Documents", tasks:[
      { id:"t1", name:"Non-disclosure agreement (NDA)", note:"" },
      { id:"t2", name:"Letter of intent (LOI) / term sheet", note:"" },
      { id:"t3", name:"Deal structure and tax planning analysis", note:"" },
    ]},
    { id:"p2", name:"Due Diligence", tasks:[
      { id:"t1", name:"Legal due diligence coordination and review", note:"" },
      { id:"t2", name:"Corporate records and capitalization review", note:"" },
      { id:"t3", name:"Material contracts review", note:"" },
      { id:"t4", name:"Intellectual property and technology", note:"" },
      { id:"t5", name:"Employment and benefits review", note:"" },
      { id:"t6", name:"Real estate and environmental review", note:"if applicable" },
      { id:"t7", name:"Litigation and regulatory review", note:"" },
      { id:"t8", name:"Data room management", note:"" },
    ]},
    { id:"p3", name:"Transaction Documents", tasks:[
      { id:"t1", name:"Definitive agreement drafting and negotiation", note:"" },
      { id:"t2", name:"Representations, warranties and covenants", note:"" },
      { id:"t3", name:"Disclosure schedules preparation", note:"" },
      { id:"t4", name:"Ancillary agreements", note:"employment, IP assignment, escrow, etc." },
      { id:"t5", name:"Board and stockholder approvals and resolutions", note:"" },
    ]},
    { id:"p4", name:"Regulatory & Third-Party Approvals", tasks:[
      { id:"t1", name:"HSR Act / antitrust filing and review", note:"if required" },
      { id:"t2", name:"CFIUS review", note:"if applicable" },
      { id:"t3", name:"Industry-specific regulatory approvals", note:"if applicable" },
      { id:"t4", name:"Third-party consents and notices", note:"" },
    ]},
    { id:"p5", name:"Signing & Pre-Closing", tasks:[
      { id:"t1", name:"Signing mechanics and deliverables", note:"" },
      { id:"t2", name:"Satisfaction of closing conditions", note:"" },
      { id:"t3", name:"Pre-closing reorganization", note:"if applicable" },
    ]},
    { id:"p6", name:"Closing & Post-Closing", tasks:[
      { id:"t1", name:"Closing mechanics and funds flow", note:"" },
      { id:"t2", name:"Post-closing purchase price adjustments", note:"" },
      { id:"t3", name:"Earn-out provisions and administration", note:"if applicable" },
      { id:"t4", name:"Post-closing integration support", note:"" },
    ]},
  ],
  ma_pe: [
    { id:"p1", name:"Pre-Deal", tasks:[
      { id:"t1", name:"NDA and process letter review", note:"" },
      { id:"t2", name:"Letter of intent / bid letter", note:"" },
      { id:"t3", name:"Deal structure and tax analysis", note:"" },
    ]},
    { id:"p2", name:"Due Diligence", tasks:[
      { id:"t1", name:"Legal due diligence", note:"" },
      { id:"t2", name:"IP and technology review", note:"" },
      { id:"t3", name:"Employment and benefits review", note:"" },
      { id:"t4", name:"Real estate and environmental", note:"if applicable" },
      { id:"t5", name:"Litigation and regulatory review", note:"" },
    ]},
    { id:"p3", name:"Financing Documents", tasks:[
      { id:"t1", name:"Debt commitment letters review and negotiation", note:"" },
      { id:"t2", name:"Credit agreement and security documents", note:"" },
      { id:"t3", name:"Intercreditor agreements", note:"if applicable" },
      { id:"t4", name:"Equity commitment letters and limited guaranty", note:"" },
    ]},
    { id:"p4", name:"Transaction Documents", tasks:[
      { id:"t1", name:"Purchase / merger agreement", note:"" },
      { id:"t2", name:"Rollover equity and management equity documents", note:"if applicable" },
      { id:"t3", name:"Disclosure schedules", note:"" },
      { id:"t4", name:"Ancillary agreements", note:"" },
      { id:"t5", name:"Board and stockholder approvals", note:"" },
    ]},
    { id:"p5", name:"Regulatory Approvals", tasks:[
      { id:"t1", name:"HSR Act / antitrust filing", note:"if required" },
      { id:"t2", name:"CFIUS review", note:"if applicable" },
      { id:"t3", name:"Other regulatory approvals", note:"if applicable" },
    ]},
    { id:"p6", name:"Closing & Post-Closing", tasks:[
      { id:"t1", name:"Closing mechanics and funds flow", note:"" },
      { id:"t2", name:"Post-closing purchase price adjustments", note:"" },
      { id:"t3", name:"Portfolio company governance setup", note:"" },
    ]},
  ],
  vc_growth: [
    { id:"p1", name:"Term Sheet", tasks:[
      { id:"t1", name:"Term sheet review and negotiation", note:"" },
      { id:"t2", name:"Cap table and dilution analysis", note:"" },
    ]},
    { id:"p2", name:"Due Diligence", tasks:[
      { id:"t1", name:"Corporate records and capitalization review", note:"" },
      { id:"t2", name:"Intellectual property ownership review", note:"" },
      { id:"t3", name:"Material contracts review", note:"" },
      { id:"t4", name:"Employment and benefits review", note:"" },
      { id:"t5", name:"Regulatory compliance review", note:"" },
    ]},
    { id:"p3", name:"Transaction Documents", tasks:[
      { id:"t1", name:"Stock purchase agreement", note:"" },
      { id:"t2", name:"Amended and restated certificate of incorporation", note:"" },
      { id:"t3", name:"Investor rights agreement", note:"" },
      { id:"t4", name:"Right of first refusal and co-sale agreement", note:"" },
      { id:"t5", name:"Voting agreement", note:"" },
      { id:"t6", name:"Management rights letter", note:"" },
      { id:"t7", name:"Board and stockholder consents", note:"" },
    ]},
    { id:"p4", name:"Closing & Post-Closing", tasks:[
      { id:"t1", name:"Closing mechanics", note:"" },
      { id:"t2", name:"Cap table update and 409A coordination", note:"" },
      { id:"t3", name:"Post-closing deliverables", note:"" },
    ]},
  ],
  capital_markets_ipo: [
    { id:"p1", name:"Pre-Filing Preparation", tasks:[
      { id:"t1", name:"Organizational meeting and deal planning", note:"" },
      { id:"t2", name:"Due diligence and corporate cleanup", note:"" },
      { id:"t3", name:"Equity plan review and refreshment", note:"" },
      { id:"t4", name:"Recapitalization / pre-IPO reorganization", note:"if applicable" },
    ]},
    { id:"p2", name:"Registration Statement (S-1)", tasks:[
      { id:"t1", name:"S-1 drafting", note:"" },
      { id:"t2", name:"Prospectus and MD&A preparation", note:"" },
      { id:"t3", name:"Risk factors drafting", note:"" },
      { id:"t4", name:"Financial statement coordination", note:"auditor liaison" },
      { id:"t5", name:"Initial SEC filing", note:"" },
    ]},
    { id:"p3", name:"SEC Review Process", tasks:[
      { id:"t1", name:"SEC comment letter responses", note:"" },
      { id:"t2", name:"Amended registration statements (S-1/A)", note:"" },
    ]},
    { id:"p4", name:"Marketing & Pricing", tasks:[
      { id:"t1", name:"Roadshow preparation and materials", note:"" },
      { id:"t2", name:"Analyst presentation review", note:"" },
      { id:"t3", name:"Pricing and allocation", note:"" },
    ]},
    { id:"p5", name:"Closing", tasks:[
      { id:"t1", name:"Underwriting agreement", note:"" },
      { id:"t2", name:"Lock-up agreements", note:"" },
      { id:"t3", name:"Closing mechanics and Blue Sky filings", note:"" },
    ]},
    { id:"p6", name:"Post-IPO Compliance Setup", tasks:[
      { id:"t1", name:"Exchange Act reporting setup (10-K, 10-Q, proxy)", note:"" },
      { id:"t2", name:"Reg FD and insider trading policy", note:"" },
      { id:"t3", name:"D&O insurance coordination", note:"" },
    ]},
  ],
  capital_markets_debt: [
    { id:"p1", name:"Preparation & Due Diligence", tasks:[
      { id:"t1", name:"Offering structure and documentation planning", note:"" },
      { id:"t2", name:"Due diligence", note:"" },
      { id:"t3", name:"Rating agency materials and process", note:"" },
    ]},
    { id:"p2", name:"Offering Documents", tasks:[
      { id:"t1", name:"Indenture drafting and negotiation", note:"" },
      { id:"t2", name:"Registration statement or offering memorandum", note:"" },
      { id:"t3", name:"Underwriting / purchase agreement", note:"" },
    ]},
    { id:"p3", name:"SEC Review / Regulatory", tasks:[
      { id:"t1", name:"SEC comments and amendments", note:"registered offering" },
      { id:"t2", name:"Exchange Act compliance", note:"" },
    ]},
    { id:"p4", name:"Closing", tasks:[
      { id:"t1", name:"Closing mechanics and funds flow", note:"" },
      { id:"t2", name:"Exchange listing", note:"if applicable" },
    ]},
  ],
  private_placement: [
    { id:"p1", name:"Structuring & Documentation", tasks:[
      { id:"t1", name:"Offering structure analysis", note:"" },
      { id:"t2", name:"Private placement memorandum (PPM)", note:"" },
      { id:"t3", name:"Subscription agreement", note:"" },
      { id:"t4", name:"Investor rights and side letter provisions", note:"" },
    ]},
    { id:"p2", name:"Investor Diligence & Negotiation", tasks:[
      { id:"t1", name:"Investor diligence response", note:"" },
      { id:"t2", name:"Term negotiation with lead investors", note:"" },
      { id:"t3", name:"Accredited investor / QIB qualification", note:"" },
    ]},
    { id:"p3", name:"Closing & Compliance", tasks:[
      { id:"t1", name:"Closing mechanics (initial and rolling closings)", note:"" },
      { id:"t2", name:"Reg D / securities law filings", note:"" },
    ]},
  ],
  real_estate_acq: [
    { id:"p1", name:"Letter of Intent & PSA", tasks:[
      { id:"t1", name:"Letter of intent", note:"" },
      { id:"t2", name:"Purchase and sale agreement drafting and negotiation", note:"" },
      { id:"t3", name:"Entity structuring", note:"" },
    ]},
    { id:"p2", name:"Due Diligence", tasks:[
      { id:"t1", name:"Title and survey review", note:"" },
      { id:"t2", name:"Environmental review (Phase I / Phase II)", note:"" },
      { id:"t3", name:"Zoning and land use review", note:"" },
      { id:"t4", name:"Lease review and tenant estoppels", note:"if occupied property" },
      { id:"t5", name:"Physical and engineering review coordination", note:"" },
    ]},
    { id:"p3", name:"Financing", tasks:[
      { id:"t1", name:"Loan commitment review", note:"if applicable" },
      { id:"t2", name:"Mortgage and deed of trust", note:"if applicable" },
      { id:"t3", name:"Title insurance commitment", note:"" },
    ]},
    { id:"p4", name:"Closing", tasks:[
      { id:"t1", name:"Transfer tax analysis and planning", note:"" },
      { id:"t2", name:"Closing mechanics and settlement", note:"" },
      { id:"t3", name:"Title insurance policy", note:"" },
      { id:"t4", name:"Post-closing deliverables", note:"" },
    ]},
  ],
  real_estate_finance: [
    { id:"p1", name:"Commitment Letter", tasks:[
      { id:"t1", name:"Review and negotiation of commitment letter", note:"" },
    ]},
    { id:"p2", name:"Due Diligence", tasks:[
      { id:"t1", name:"Borrower entity review", note:"" },
      { id:"t2", name:"Title and survey review", note:"" },
      { id:"t3", name:"Environmental review", note:"" },
      { id:"t4", name:"Lease and rent roll review", note:"if applicable" },
      { id:"t5", name:"Appraisal and property condition coordination", note:"" },
    ]},
    { id:"p3", name:"Loan Documents", tasks:[
      { id:"t1", name:"Loan agreement drafting and negotiation", note:"" },
      { id:"t2", name:"Mortgage and deed of trust", note:"" },
      { id:"t3", name:"Security agreement and assignment of leases and rents", note:"" },
      { id:"t4", name:"Guaranty agreements", note:"" },
      { id:"t5", name:"Intercreditor agreement", note:"if applicable" },
    ]},
    { id:"p4", name:"Closing", tasks:[
      { id:"t1", name:"Conditions precedent and UCC searches", note:"" },
      { id:"t2", name:"Title insurance coordination", note:"" },
      { id:"t3", name:"Closing mechanics and funds disbursement", note:"" },
    ]},
  ],
  commercial_lending: [
    { id:"p1", name:"Term Sheet & Commitment Letter", tasks:[
      { id:"t1", name:"Term sheet review and negotiation", note:"" },
      { id:"t2", name:"Commitment letter", note:"" },
    ]},
    { id:"p2", name:"Due Diligence", tasks:[
      { id:"t1", name:"Borrower entity and organizational review", note:"" },
      { id:"t2", name:"Collateral review and UCC / lien searches", note:"" },
      { id:"t3", name:"Material contracts and IP review", note:"" },
    ]},
    { id:"p3", name:"Credit Documents", tasks:[
      { id:"t1", name:"Credit agreement drafting and negotiation", note:"" },
      { id:"t2", name:"Security agreement and pledge agreement", note:"" },
      { id:"t3", name:"Guaranty agreements", note:"" },
      { id:"t4", name:"Deposit account control agreements", note:"" },
      { id:"t5", name:"Mortgages and deeds of trust", note:"if real property collateral" },
      { id:"t6", name:"Intercreditor agreements", note:"if applicable" },
    ]},
    { id:"p4", name:"Closing", tasks:[
      { id:"t1", name:"Conditions precedent satisfaction", note:"" },
      { id:"t2", name:"UCC filings and perfection of security interests", note:"" },
      { id:"t3", name:"Closing mechanics and funds disbursement", note:"" },
    ]},
    { id:"p5", name:"Post-Closing", tasks:[
      { id:"t1", name:"Post-closing deliverables", note:"" },
      { id:"t2", name:"Amendment and waiver support", note:"as needed" },
    ]},
  ],
  joint_venture: [
    { id:"p1", name:"Structuring & Term Sheet", tasks:[
      { id:"t1", name:"JV structure and tax analysis", note:"" },
      { id:"t2", name:"Term sheet negotiation", note:"" },
    ]},
    { id:"p2", name:"Due Diligence", tasks:[
      { id:"t1", name:"Partner entity review", note:"" },
      { id:"t2", name:"Contributed asset and IP review", note:"" },
      { id:"t3", name:"Regulatory and antitrust review", note:"" },
    ]},
    { id:"p3", name:"JV Documents", tasks:[
      { id:"t1", name:"Operating / partnership agreement", note:"" },
      { id:"t2", name:"Contribution agreement", note:"" },
      { id:"t3", name:"Management and services agreement", note:"" },
      { id:"t4", name:"IP license agreement", note:"if applicable" },
      { id:"t5", name:"Ancillary agreements", note:"" },
    ]},
    { id:"p4", name:"Closing", tasks:[
      { id:"t1", name:"Regulatory approvals and third-party consents", note:"" },
      { id:"t2", name:"Closing mechanics", note:"" },
    ]},
  ],
  licensing_ip: [
    { id:"p1", name:"Deal Structuring", tasks:[
      { id:"t1", name:"License / assignment structure analysis", note:"" },
      { id:"t2", name:"IP valuation considerations", note:"" },
    ]},
    { id:"p2", name:"Due Diligence", tasks:[
      { id:"t1", name:"IP ownership and chain of title review", note:"" },
      { id:"t2", name:"Third-party licenses and encumbrances", note:"" },
      { id:"t3", name:"Freedom to operate analysis", note:"" },
    ]},
    { id:"p3", name:"License / Assignment Agreement", tasks:[
      { id:"t1", name:"Agreement drafting and negotiation", note:"" },
      { id:"t2", name:"Grant of rights and field of use restrictions", note:"" },
      { id:"t3", name:"Royalties and payment terms", note:"" },
      { id:"t4", name:"Warranties, representations and indemnification", note:"" },
      { id:"t5", name:"Term and termination provisions", note:"" },
    ]},
    { id:"p4", name:"Ancillary Documents & Closing", tasks:[
      { id:"t1", name:"Technical information and know-how agreement", note:"if applicable" },
      { id:"t2", name:"Development milestones and commercialization provisions", note:"if applicable" },
      { id:"t3", name:"IP recordation and assignments", note:"" },
    ]},
  ],
  restructuring: [
    { id:"p1", name:"Pre-Petition Planning", tasks:[
      { id:"t1", name:"Restructuring analysis and strategy", note:"" },
      { id:"t2", name:"Creditor negotiations and forbearance agreements", note:"" },
      { id:"t3", name:"DIP financing arrangements", note:"" },
      { id:"t4", name:"First day motions preparation", note:"" },
      { id:"t5", name:"Retention applications", note:"" },
    ]},
    { id:"p2", name:"Chapter 11 Administration", tasks:[
      { id:"t1", name:"First day hearings", note:"" },
      { id:"t2", name:"DIP financing and cash collateral orders", note:"" },
      { id:"t3", name:"Claims administration", note:"" },
      { id:"t4", name:"Executory contracts (assume / reject)", note:"" },
      { id:"t5", name:"363 asset sales", note:"if applicable" },
      { id:"t6", name:"Adversary proceedings", note:"if applicable" },
    ]},
    { id:"p3", name:"Plan of Reorganization", tasks:[
      { id:"t1", name:"Plan and disclosure statement drafting", note:"" },
      { id:"t2", name:"Solicitation and voting", note:"" },
      { id:"t3", name:"Confirmation hearing preparation and argument", note:"" },
    ]},
    { id:"p4", name:"Post-Confirmation", tasks:[
      { id:"t1", name:"Effective date transactions", note:"" },
      { id:"t2", name:"Distributions to creditors", note:"" },
      { id:"t3", name:"Post-emergence governance and wind-down", note:"" },
    ]},
  ],
};

const CORP_CAVEATS = [
  "This estimate covers legal fees only and does not include filing fees, regulatory fees, transfer taxes, title insurance premiums, or other third-party costs.",
  "Scope and fees may vary significantly based on deal complexity, counterparty cooperation, and issues identified during due diligence.",
  "This estimate assumes the transaction closes without material litigation, injunctions, or regulatory delays.",
  "Fees may increase if negotiations are protracted, additional parties are added, or the transaction structure changes materially.",
  "This estimate does not include standalone tax advice or post-closing tax compliance beyond routine transaction support.",
  "Regulatory approval timelines and associated fees are excluded unless specifically identified above.",
  "Rate escalation over the course of the engagement is not reflected in this estimate.",
];

const CORP_GOVERNING_LAW = ["To Be Determined","Delaware","New York","California","Texas","Florida","Illinois","Massachusetts","Nevada","English Law","Other International"];

// ── Tax Library ───────────────────────────────────────────────────────────────

const TAX_MATTER_LABELS = {
  irs_audit:         "IRS Examination / Audit",
  irs_appeals:       "IRS Office of Appeals",
  tax_court:         "U.S. Tax Court Litigation",
  district_court_tax:"Federal District Court Tax Litigation",
  salt_controversy:  "State & Local Tax (SALT) Controversy",
  transfer_pricing:  "Transfer Pricing Dispute",
  criminal_tax:      "Criminal Tax Investigation",
  ma_tax:            "M&A Tax Structuring",
  intl_tax:          "International Tax Planning",
  partnership_tax:   "Partnership / LLC Tax",
  exec_comp:         "Executive Compensation & Equity (280G / 409A)",
  tax_exempt:        "Tax-Exempt / Nonprofit",
};

const TAX_LIBRARY = {
  irs_audit: [
    { id:"p1", name:"Pre-Examination", tasks:[
      { id:"t1", name:"Initial IDR response strategy", note:"" },
      { id:"t2", name:"Document gathering and privilege review", note:"" },
      { id:"t3", name:"Kick-off meeting with revenue agent", note:"" },
    ]},
    { id:"p2", name:"Examination", tasks:[
      { id:"t1", name:"Ongoing IDR responses", note:"" },
      { id:"t2", name:"Factual development and witness preparation", note:"" },
      { id:"t3", name:"Legal research and position memoranda", note:"" },
    ]},
    { id:"p3", name:"30-Day Letter / Protest", tasks:[
      { id:"t1", name:"Protest drafting", note:"" },
      { id:"t2", name:"Rebuttal to revenue agent report", note:"" },
    ]},
    { id:"p4", name:"Resolution", tasks:[
      { id:"t1", name:"Settlement negotiations", note:"" },
      { id:"t2", name:"Closing agreement", note:"" },
      { id:"t3", name:"Referral to Appeals or litigation", note:"if applicable" },
    ]},
  ],
  irs_appeals: [
    { id:"p1", name:"Protest Preparation", tasks:[
      { id:"t1", name:"Protest filing and perfection", note:"" },
      { id:"t2", name:"Case theory development", note:"" },
      { id:"t3", name:"Legal research and brief preparation", note:"" },
    ]},
    { id:"p2", name:"Appeals Conference", tasks:[
      { id:"t1", name:"Pre-conference preparation", note:"" },
      { id:"t2", name:"Appeals officer conference", note:"" },
      { id:"t3", name:"Supplemental submissions", note:"if requested" },
    ]},
    { id:"p3", name:"Settlement / Resolution", tasks:[
      { id:"t1", name:"Settlement negotiations", note:"" },
      { id:"t2", name:"Closing agreement and documentation", note:"" },
    ]},
  ],
  tax_court: [
    { id:"p1", name:"Pre-Filing", tasks:[
      { id:"t1", name:"Statutory notice of deficiency review", note:"" },
      { id:"t2", name:"Petition drafting and filing", note:"" },
    ]},
    { id:"p2", name:"Pleadings", tasks:[
      { id:"t1", name:"Review IRS answer", note:"" },
      { id:"t2", name:"Amended petition", note:"if applicable" },
    ]},
    { id:"p3", name:"Discovery", tasks:[
      { id:"t1", name:"Stipulation of facts negotiation", note:"" },
      { id:"t2", name:"Document requests and responses", note:"" },
    ]},
    { id:"p4", name:"Motions", tasks:[
      { id:"t1", name:"Summary judgment", note:"if applicable" },
      { id:"t2", name:"Motions in limine", note:"" },
    ]},
    { id:"p5", name:"Trial Preparation", tasks:[
      { id:"t1", name:"Pretrial memorandum", note:"" },
      { id:"t2", name:"Expert witness preparation", note:"if applicable" },
      { id:"t3", name:"Witness preparation", note:"" },
    ]},
    { id:"p6", name:"Trial", tasks:[
      { id:"t1", name:"Trial (per day estimate)", note:"" },
    ]},
    { id:"p7", name:"Post-Trial", tasks:[
      { id:"t1", name:"Post-trial briefs", note:"" },
      { id:"t2", name:"Decision review and appeal", note:"if applicable" },
    ]},
  ],
  district_court_tax: [
    { id:"p1", name:"Pre-Filing", tasks:[
      { id:"t1", name:"Refund claim preparation and filing", note:"" },
      { id:"t2", name:"Six-month waiting period strategy", note:"" },
    ]},
    { id:"p2", name:"Pleadings", tasks:[
      { id:"t1", name:"Complaint drafting and filing", note:"" },
      { id:"t2", name:"Answer to government response", note:"" },
    ]},
    { id:"p3", name:"Discovery", tasks:[
      { id:"t1", name:"Written discovery", note:"" },
      { id:"t2", name:"Depositions", note:"" },
      { id:"t3", name:"Expert reports", note:"" },
    ]},
    { id:"p4", name:"Motions", tasks:[
      { id:"t1", name:"Summary judgment briefing", note:"" },
    ]},
    { id:"p5", name:"Trial", tasks:[
      { id:"t1", name:"Trial preparation", note:"" },
      { id:"t2", name:"Trial (per day estimate)", note:"" },
    ]},
    { id:"p6", name:"Post-Trial", tasks:[
      { id:"t1", name:"Post-trial motions and appeal", note:"if applicable" },
    ]},
  ],
  salt_controversy: [
    { id:"p1", name:"Audit / Examination", tasks:[
      { id:"t1", name:"State audit response and IDR management", note:"" },
      { id:"t2", name:"Nexus and apportionment analysis", note:"" },
      { id:"t3", name:"Legal research on state-specific positions", note:"" },
    ]},
    { id:"p2", name:"Administrative Appeals", tasks:[
      { id:"t1", name:"Protest and hearing preparation", note:"" },
      { id:"t2", name:"Administrative hearing", note:"" },
    ]},
    { id:"p3", name:"Litigation", tasks:[
      { id:"t1", name:"State court or tribunal proceedings", note:"" },
      { id:"t2", name:"Briefing and argument", note:"" },
    ]},
    { id:"p4", name:"Multistate Coordination", tasks:[
      { id:"t1", name:"Voluntary disclosure agreements", note:"if applicable" },
      { id:"t2", name:"Multistate settlement negotiations", note:"" },
    ]},
  ],
  transfer_pricing: [
    { id:"p1", name:"Documentation", tasks:[
      { id:"t1", name:"Transfer pricing study preparation", note:"" },
      { id:"t2", name:"Country-by-country reporting review", note:"" },
      { id:"t3", name:"Benchmarking and economic analysis", note:"" },
    ]},
    { id:"p2", name:"Examination Defense", tasks:[
      { id:"t1", name:"IDR responses", note:"" },
      { id:"t2", name:"Technical position papers", note:"" },
      { id:"t3", name:"Coordination with economists and experts", note:"" },
    ]},
    { id:"p3", name:"Advance Pricing Agreement (APA)", tasks:[
      { id:"t1", name:"APA prefiling conference", note:"if pursuing" },
      { id:"t2", name:"APA submission and negotiation", note:"" },
    ]},
    { id:"p4", name:"Competent Authority / MAP", tasks:[
      { id:"t1", name:"Mutual agreement procedure request", note:"if applicable" },
      { id:"t2", name:"Competent authority negotiation", note:"" },
    ]},
  ],
  criminal_tax: [
    { id:"p1", name:"Investigation Phase", tasks:[
      { id:"t1", name:"Grand jury representation", note:"" },
      { id:"t2", name:"Document review and privilege analysis", note:"" },
      { id:"t3", name:"Parallel civil proceeding coordination", note:"" },
    ]},
    { id:"p2", name:"Pre-Indictment", tasks:[
      { id:"t1", name:"Proffer and reverse proffer sessions", note:"" },
      { id:"t2", name:"Plea negotiations", note:"if applicable" },
      { id:"t3", name:"Target letter response", note:"" },
    ]},
    { id:"p3", name:"Indictment & Arraignment", tasks:[
      { id:"t1", name:"Arraignment and conditions of release", note:"" },
      { id:"t2", name:"Initial case strategy", note:"" },
    ]},
    { id:"p4", name:"Pre-Trial", tasks:[
      { id:"t1", name:"Motions to suppress / dismiss", note:"" },
      { id:"t2", name:"Discovery", note:"" },
      { id:"t3", name:"Expert retention and preparation", note:"" },
    ]},
    { id:"p5", name:"Trial", tasks:[
      { id:"t1", name:"Trial preparation", note:"" },
      { id:"t2", name:"Trial (per day estimate)", note:"" },
    ]},
    { id:"p6", name:"Sentencing / Post-Trial", tasks:[
      { id:"t1", name:"Sentencing memorandum", note:"" },
      { id:"t2", name:"Appeal", note:"if applicable" },
    ]},
  ],
  ma_tax: [
    { id:"p1", name:"Deal Structuring", tasks:[
      { id:"t1", name:"Asset vs. stock analysis", note:"" },
      { id:"t2", name:"Tax-free reorganization analysis", note:"if applicable" },
      { id:"t3", name:"Section 338 / 336(e) election analysis", note:"if applicable" },
      { id:"t4", name:"State and local tax structuring", note:"" },
    ]},
    { id:"p2", name:"Tax Due Diligence", tasks:[
      { id:"t1", name:"Federal tax due diligence review", note:"" },
      { id:"t2", name:"State and local tax exposure review", note:"" },
      { id:"t3", name:"International tax review", note:"if applicable" },
    ]},
    { id:"p3", name:"Documentation", tasks:[
      { id:"t1", name:"Tax representations and warranties", note:"" },
      { id:"t2", name:"Tax indemnification provisions", note:"" },
      { id:"t3", name:"Tax covenant review", note:"" },
    ]},
    { id:"p4", name:"Closing & Post-Closing", tasks:[
      { id:"t1", name:"Tax opinion or ruling", note:"if required" },
      { id:"t2", name:"Purchase price allocation (Section 1060)", note:"" },
      { id:"t3", name:"Post-closing tax matters", note:"" },
    ]},
  ],
  intl_tax: [
    { id:"p1", name:"Structure Design", tasks:[
      { id:"t1", name:"Cross-border structure analysis", note:"" },
      { id:"t2", name:"Treaty analysis and planning", note:"" },
      { id:"t3", name:"Check-the-box and entity classification", note:"" },
    ]},
    { id:"p2", name:"TCJA / International Provisions", tasks:[
      { id:"t1", name:"GILTI, FDII, BEAT analysis", note:"" },
      { id:"t2", name:"Subpart F review", note:"" },
      { id:"t3", name:"PFIC analysis", note:"if applicable" },
    ]},
    { id:"p3", name:"Documentation & Compliance", tasks:[
      { id:"t1", name:"Transfer pricing documentation", note:"" },
      { id:"t2", name:"Form 5471 / 8865 / 8858 review", note:"" },
      { id:"t3", name:"FBAR / FATCA compliance", note:"if applicable" },
    ]},
    { id:"p4", name:"Implementation", tasks:[
      { id:"t1", name:"Entity formation and reorganization", note:"" },
      { id:"t2", name:"Regulatory filings", note:"" },
    ]},
  ],
  partnership_tax: [
    { id:"p1", name:"Structure & Agreement", tasks:[
      { id:"t1", name:"Partnership agreement tax provisions", note:"" },
      { id:"t2", name:"Allocation methodology (Section 704(b))", note:"" },
      { id:"t3", name:"Capital account maintenance", note:"" },
    ]},
    { id:"p2", name:"Special Allocations & Transactions", tasks:[
      { id:"t1", name:"Section 704(c) built-in gain analysis", note:"" },
      { id:"t2", name:"Disguised sale / debt-financed distribution analysis", note:"" },
      { id:"t3", name:"Guaranteed payments and carried interest", note:"" },
    ]},
    { id:"p3", name:"Compliance & Reporting", tasks:[
      { id:"t1", name:"K-1 review and partner reporting", note:"" },
      { id:"t2", name:"BBA audit rules compliance", note:"" },
      { id:"t3", name:"State and local pass-through issues", note:"" },
    ]},
  ],
  exec_comp: [
    { id:"p1", name:"280G – Golden Parachute", tasks:[
      { id:"t1", name:"Parachute payment calculation", note:"" },
      { id:"t2", name:"Reasonable compensation analysis", note:"" },
      { id:"t3", name:"Stockholder approval / cleansing vote", note:"if applicable" },
    ]},
    { id:"p2", name:"409A – Deferred Compensation", tasks:[
      { id:"t1", name:"Plan document review and compliance", note:"" },
      { id:"t2", name:"409A valuation review", note:"" },
      { id:"t3", name:"Correction / documentary compliance", note:"if needed" },
    ]},
    { id:"p3", name:"Equity & Incentive Plans", tasks:[
      { id:"t1", name:"ISO / NSO analysis", note:"" },
      { id:"t2", name:"Section 83(b) election planning", note:"" },
      { id:"t3", name:"QSBS analysis (Section 1202)", note:"if applicable" },
      { id:"t4", name:"Profits interest / carried interest structuring", note:"" },
    ]},
    { id:"p4", name:"Implementation", tasks:[
      { id:"t1", name:"Plan documentation and board consents", note:"" },
      { id:"t2", name:"Award agreements", note:"" },
    ]},
  ],
  tax_exempt: [
    { id:"p1", name:"Formation & Application", tasks:[
      { id:"t1", name:"Form 1023 / 1023-EZ preparation and filing", note:"" },
      { id:"t2", name:"Narrative description of activities", note:"" },
      { id:"t3", name:"IRS correspondence and follow-up", note:"" },
    ]},
    { id:"p2", name:"Ongoing Compliance", tasks:[
      { id:"t1", name:"Unrelated business income (UBIT) analysis", note:"" },
      { id:"t2", name:"Private benefit / private inurement review", note:"" },
      { id:"t3", name:"Form 990 review", note:"" },
    ]},
    { id:"p3", name:"Governance & Transactions", tasks:[
      { id:"t1", name:"Conflict of interest policy review", note:"" },
      { id:"t2", name:"Excess benefit transaction analysis", note:"" },
      { id:"t3", name:"Joint ventures with for-profit entities", note:"if applicable" },
    ]},
    { id:"p4", name:"State Exemptions", tasks:[
      { id:"t1", name:"State income / franchise tax exemption", note:"" },
      { id:"t2", name:"State sales tax exemption filings", note:"" },
    ]},
  ],
};

const TAX_CAVEATS = [
  "This estimate covers legal fees only and does not include taxes owed, penalties, interest, filing fees, or court costs.",
  "Accounting, economic analysis, and expert witness fees are excluded and should be budgeted separately.",
  "Tax controversy estimates assume good-faith cooperation from the taxing authority and do not account for escalation to higher review levels.",
  "Fees for related state or local tax proceedings are excluded unless specifically identified above.",
  "Transfer pricing and international tax matters may require non-U.S. counsel whose fees are not included.",
  "Scope may expand significantly if the matter involves fraud penalties, promoter investigations, or multistate complexity.",
  "Rate escalation over the course of the engagement is not reflected in this estimate.",
];

const FEE_TYPES = [
  { v:"hourly", l:"Hourly — ranges by timekeeper level" },
  { v:"fixed", l:"Fixed fee per phase" },
  { v:"blended", l:"Blended rate" },
  { v:"contingency", l:"Contingency / success fee" },
];
const STEPS = ["Matter","Phases","Costs","Fee Type","Caveats","Output"];
const TITLES = ["Partner","Counsel","Senior Associate","Associate","Staff Attorney","Paralegal","Other"];

// ── Utilities ─────────────────────────────────────────────────────────────────

const uid = () => Math.random().toString(36).slice(2,8);
const fmt = n => n ? "$" + Number(n).toLocaleString() : "—";
const fmtHrs = n => n ? `${n}h` : "—";

export const buildPhases = (type, m = "litigation") => {
  const lib = m === "corporate" ? CORP_LIBRARY : m === "tax" ? TAX_LIBRARY : LIBRARY;
  return (lib[type] || []).map(p => ({
    ...p, selected: true,
    tasks: p.tasks.map(t => ({ ...t, selected: true, low: "", high: "", note: t.note, aiRationale: "", tkBreakdown: null }))
  }));
};

export function parseDurationMonths(str) {
  if (!str) return 12;
  const s = str.toLowerCase();
  const range = s.match(/(\d+)\s*[-–]\s*(\d+)\s*month/);
  if (range) return Math.round((parseInt(range[1]) + parseInt(range[2])) / 2);
  const single = s.match(/(\d+)\s*month/);
  if (single) return parseInt(single[1]);
  const years = s.match(/(\d+)\s*[-–]\s*(\d+)\s*year/);
  if (years) return Math.round((parseInt(years[1]) + parseInt(years[2])) / 2) * 12;
  const year = s.match(/(\d+)\s*year/);
  if (year) return parseInt(year[1]) * 12;
  return 12;
}

// ── Styles ────────────────────────────────────────────────────────────────────

const N = "#1a2744";
const ACCENT = "#2e5fa3";
const BG = "#f7f6f3";
const BORDER = "#dddbd5";
const TEXT = "#1a1a1a";
const MUTED = "#777";

const s = {
  wrap: { fontFamily: "Georgia, 'Times New Roman', serif", background: BG, minHeight: "100vh", padding: "0 0 60px" },
  header: { background: N, padding: "20px 32px", display: "flex", alignItems: "center", justifyContent: "space-between" },
  headerTitle: { color: "#fff", fontSize: 15, fontWeight: 400, letterSpacing: "0.08em", textTransform: "uppercase", fontFamily: "sans-serif" },
  headerSub: { color: "#8a9cbf", fontSize: 12, fontFamily: "sans-serif", marginTop: 3 },
  steps: { background: "#fff", borderBottom: `1px solid ${BORDER}`, padding: "0 32px", display: "flex", gap: 0 },
  stepItem: (active, done) => ({
    padding: "14px 20px", fontSize: 12, fontFamily: "sans-serif", letterSpacing: "0.06em",
    textTransform: "uppercase", cursor: "pointer", borderBottom: `2px solid ${active ? ACCENT : "transparent"}`,
    color: active ? ACCENT : done ? TEXT : MUTED, fontWeight: active ? 600 : 400, transition: "all 0.15s",
  }),
  body: { maxWidth: 820, margin: "0 auto", padding: "36px 24px 0" },
  card: { background: "#fff", border: `1px solid ${BORDER}`, borderRadius: 4, padding: "28px 32px", marginBottom: 20 },
  sectionTitle: { fontSize: 11, fontFamily: "sans-serif", letterSpacing: "0.1em", textTransform: "uppercase", color: MUTED, marginBottom: 16, fontWeight: 600 },
  label: { display: "block", fontSize: 12, fontFamily: "sans-serif", color: MUTED, marginBottom: 5, letterSpacing: "0.04em", textTransform: "uppercase" },
  input: { width: "100%", boxSizing: "border-box", border: `1px solid ${BORDER}`, borderRadius: 3, padding: "9px 12px", fontSize: 14, fontFamily: "Georgia, serif", color: TEXT, background: "#fff", outline: "none" },
  select: { width: "100%", boxSizing: "border-box", border: `1px solid ${BORDER}`, borderRadius: 3, padding: "9px 12px", fontSize: 14, fontFamily: "sans-serif", color: TEXT, background: "#fff", outline: "none" },
  row2: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 },
  row3: { display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16, marginBottom: 16 },
  fieldWrap: { marginBottom: 16 },
  phaseHeader: { display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 0 8px", borderBottom: `1px solid ${BORDER}`, marginBottom: 8 },
  phaseLabel: { fontSize: 13, fontFamily: "sans-serif", fontWeight: 600, color: N, letterSpacing: "0.04em" },
  taskRow: { display: "flex", alignItems: "center", gap: 12, padding: "6px 0", borderBottom: `1px solid #f0efeb` },
  taskName: { flex: 1, fontSize: 13, fontFamily: "sans-serif", color: TEXT },
  taskNote: { fontSize: 11, fontFamily: "sans-serif", color: MUTED, fontStyle: "italic" },
  moneyInput: { width: 110, border: `1px solid ${BORDER}`, borderRadius: 3, padding: "6px 10px", fontSize: 13, fontFamily: "sans-serif", color: TEXT, background: "#fafaf8", textAlign: "right", outline: "none" },
  hrsInput: { width: 72, border: `1px solid ${BORDER}`, borderRadius: 3, padding: "5px 8px", fontSize: 12, fontFamily: "sans-serif", color: TEXT, background: "#fafaf8", textAlign: "right", outline: "none" },
  btn: (primary) => ({
    padding: "10px 20px", fontSize: 12, fontFamily: "sans-serif", letterSpacing: "0.07em",
    textTransform: "uppercase", borderRadius: 3, cursor: "pointer", fontWeight: 600,
    background: primary ? N : "#fff", color: primary ? "#fff" : N,
    border: `1px solid ${primary ? N : BORDER}`, transition: "opacity 0.15s",
  }),
  btnSmall: { padding: "5px 12px", fontSize: 11, fontFamily: "sans-serif", letterSpacing: "0.06em", textTransform: "uppercase", borderRadius: 3, cursor: "pointer", fontWeight: 600, background: "#fff", color: ACCENT, border: `1px solid ${ACCENT}` },
  btnAI: { padding: "5px 12px", fontSize: 11, fontFamily: "sans-serif", letterSpacing: "0.06em", textTransform: "uppercase", borderRadius: 3, cursor: "pointer", fontWeight: 600, background: ACCENT, color: "#fff", border: `1px solid ${ACCENT}` },
  nav: { display: "flex", justifyContent: "space-between", alignItems: "center", maxWidth: 820, margin: "0 auto", padding: "24px 24px 0" },
  totalBar: { background: N, color: "#fff", borderRadius: 4, padding: "16px 24px", display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 16, fontFamily: "sans-serif" },
  caveatRow: { display: "flex", gap: 10, alignItems: "flex-start", marginBottom: 10 },
  caveatText: { flex: 1, border: `1px solid ${BORDER}`, borderRadius: 3, padding: "8px 12px", fontSize: 13, fontFamily: "Georgia, serif", color: TEXT, minHeight: 48, resize: "vertical", background: "#fafaf8", outline: "none" },
  radioRow: { display: "flex", flexDirection: "column", gap: 10 },
  radioItem: (active) => ({ display: "flex", alignItems: "center", gap: 10, padding: "12px 16px", border: `1px solid ${active ? ACCENT : BORDER}`, borderRadius: 4, cursor: "pointer", background: active ? "#eef3fb" : "#fff" }),
  radioLabel: { fontSize: 13, fontFamily: "sans-serif", color: TEXT },
  rationale: { fontSize: 11, fontFamily: "sans-serif", color: "#5a8a5a", fontStyle: "italic", marginTop: 2 },
  outputSection: { marginBottom: 20 },
  outputToggle: (active) => ({ padding: "10px 20px", fontSize: 12, fontFamily: "sans-serif", letterSpacing: "0.06em", textTransform: "uppercase", cursor: "pointer", fontWeight: active ? 700 : 400, background: active ? N : "#fff", color: active ? "#fff" : N, border: `1px solid ${N}`, borderRadius: active ? 3 : 3, flex: 1, transition: "all 0.15s" }),
  previewPhase: { marginBottom: 16 },
  previewPhaseName: { fontSize: 11, fontFamily: "sans-serif", letterSpacing: "0.1em", textTransform: "uppercase", color: MUTED, fontWeight: 700, marginBottom: 6, paddingBottom: 4, borderBottom: `1px solid ${BORDER}` },
  previewRow: { display: "flex", justifyContent: "space-between", padding: "4px 0", fontSize: 13, fontFamily: "sans-serif", borderBottom: `1px solid #f5f4f0` },
  previewTotal: { display: "flex", justifyContent: "space-between", padding: "12px 0 4px", fontWeight: 700, fontSize: 14, fontFamily: "sans-serif", borderTop: `2px solid ${N}`, marginTop: 8 },
  bdTable: { background: "#f7f6f3", border: `1px solid ${BORDER}`, borderRadius: 3, padding: "10px 12px", marginTop: 8, marginLeft: 8 },
  bdColHdr: { fontSize: 10, fontFamily: "sans-serif", color: MUTED, letterSpacing: "0.06em", textTransform: "uppercase" },
};

// ── Landing Page ──────────────────────────────────────────────────────────────

function LandingCard({ title, sub, icon, onClick }) {
  const [hov, setHov] = useState(false);
  return (
    <div
      onClick={onClick}
      onMouseEnter={()=>setHov(true)}
      onMouseLeave={()=>setHov(false)}
      style={{
        background: "#fff", border: `1px solid ${hov ? ACCENT : BORDER}`,
        borderRadius: 6, padding: "44px 36px", cursor: "pointer", flex: "1 1 260px",
        boxShadow: hov ? "0 2px 16px rgba(46,95,163,0.13)" : "none",
        transition: "border-color 0.15s, box-shadow 0.15s",
      }}
    >
      <div style={{fontSize:38,marginBottom:18,lineHeight:1}}>{icon}</div>
      <div style={{fontSize:16,fontFamily:"sans-serif",fontWeight:700,color:N,marginBottom:10,letterSpacing:"0.02em"}}>{title}</div>
      <div style={{fontSize:13,fontFamily:"sans-serif",color:MUTED,lineHeight:1.65}}>{sub}</div>
    </div>
  );
}

function LandingPage({ onSelect }) {
  return (
    <div style={{fontFamily:"Georgia,'Times New Roman',serif",minHeight:"100vh",background:"linear-gradient(-45deg,#1a2a4a,#0d3d52,#1e3348,#0a4a5c,#2d3d52)",backgroundSize:"400% 400%",animation:"gradientShift 16s ease infinite"}}>
      <style>{`
        @keyframes gradientShift {
          0%   { background-position: 0% 50%; }
          50%  { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
      `}</style>
      <div style={{padding:"20px 32px",borderBottom:"1px solid rgba(255,255,255,0.1)"}}>
        <div style={{color:"#fff",fontSize:15,fontWeight:400,letterSpacing:"0.08em",textTransform:"uppercase",fontFamily:"sans-serif"}}>Legal Budget Builder</div>
        <div style={{color:"rgba(255,255,255,0.5)",fontSize:12,fontFamily:"sans-serif",marginTop:3}}>Professional fee estimation tool</div>
      </div>
      <div style={{maxWidth:940,margin:"0 auto",padding:"72px 24px"}}>
        <div style={{textAlign:"center",marginBottom:52}}>
          <div style={{fontSize:26,fontWeight:400,color:"#fff",marginBottom:12,letterSpacing:"0.01em"}}>Select a budgeting track</div>
          <div style={{fontSize:14,fontFamily:"sans-serif",color:"rgba(255,255,255,0.6)"}}>Choose the type of engagement to begin building your fee estimate.</div>
        </div>
        <div style={{display:"flex",gap:24,flexWrap:"wrap"}}>
          <LandingCard
            title="Litigation & Dispute Resolution"
            sub="Court proceedings, arbitration, regulatory enforcement, and other contested matters."
            icon="⚖"
            onClick={()=>onSelect("litigation")}
          />
          <LandingCard
            title="Corporate & Transactional"
            sub="M&A, capital markets, private equity, real estate, lending, and other deal work."
            icon="📋"
            onClick={()=>onSelect("corporate")}
          />
          <LandingCard
            title="Tax"
            sub="IRS controversy, Tax Court, SALT, transfer pricing, criminal tax, and transactional tax planning."
            icon="🧾"
            onClick={()=>onSelect("tax")}
          />
        </div>
      </div>
    </div>
  );
}

// ── Disclaimer Page ───────────────────────────────────────────────────────────

function DisclaimerPage({ onAccept, onBack }) {
  const [checked, setChecked] = useState(false);
  return (
    <div style={{fontFamily:"Georgia,'Times New Roman',serif",background:BG,minHeight:"100vh"}}>
      <div style={{background:N,padding:"20px 32px"}}>
        <div style={{color:"#fff",fontSize:15,fontWeight:400,letterSpacing:"0.08em",textTransform:"uppercase",fontFamily:"sans-serif"}}>Legal Budget Builder</div>
        <div style={{color:"#8a9cbf",fontSize:12,fontFamily:"sans-serif",marginTop:3}}>Professional fee estimation tool</div>
      </div>
      <div style={{maxWidth:620,margin:"0 auto",padding:"72px 24px"}}>
        <div style={{background:"#fff",border:`1px solid ${BORDER}`,borderRadius:6,padding:"40px 44px"}}>
          <div style={{fontSize:13,fontFamily:"sans-serif",letterSpacing:"0.1em",textTransform:"uppercase",color:MUTED,fontWeight:600,marginBottom:20}}>Before You Continue</div>
          <div style={{fontSize:15,color:N,lineHeight:1.8,marginBottom:28}}>
            This is a testing site for demonstration purposes only. Nothing you enter is stored or transmitted to a server. <strong>Nothing will be saved!</strong>
            <br/><br/>
            Even though this tool does not store or transfer data, it is (like I said) a testing site and you should not use it with real client/matter information.
            <br/><br/>
            <strong>Use anonymized/sample data only.</strong>
          </div>
          <label style={{display:"flex",alignItems:"flex-start",gap:12,cursor:"pointer",marginBottom:28}}>
            <input
              type="checkbox"
              checked={checked}
              onChange={e=>setChecked(e.target.checked)}
              style={{accentColor:ACCENT,marginTop:3,width:16,height:16,flexShrink:0}}
            />
            <span style={{fontSize:13,fontFamily:"sans-serif",color:TEXT,lineHeight:1.6}}>
              I understand that this is a demonstration tool and I will only enter anonymized or sample data.
            </span>
          </label>
          <div style={{display:"flex",gap:12,alignItems:"center"}}>
            <button
              onClick={onAccept}
              disabled={!checked}
              style={{
                padding:"11px 28px",fontSize:12,fontFamily:"sans-serif",letterSpacing:"0.07em",
                textTransform:"uppercase",borderRadius:3,cursor:checked?"pointer":"not-allowed",fontWeight:600,
                background:checked?N:"#ccc",color:"#fff",border:"none",transition:"background 0.15s",
              }}
            >
              Continue →
            </button>
            <button
              onClick={onBack}
              style={{padding:"11px 16px",fontSize:12,fontFamily:"sans-serif",letterSpacing:"0.06em",textTransform:"uppercase",borderRadius:3,cursor:"pointer",fontWeight:400,background:"none",color:MUTED,border:`1px solid ${BORDER}`}}
            >
              ← Back
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Main App ──────────────────────────────────────────────────────────────────

// Load persisted session from localStorage (null if nothing saved)
const loadSaved = () => {
  try { return JSON.parse(localStorage.getItem("lb_session") || "null"); } catch { return null; }
};

const DEAL_VALUES = ["Not disclosed / TBD","Under $10M","$10M – $50M","$50M – $250M","$250M – $1B","$1B – $5B","Over $5B"];

export default function App() {
  const saved = useRef(loadSaved());

  const savedMode = saved.current?.mode || null;
  const defaultType = savedMode === "corporate" ? "ma_strategic" : savedMode === "tax" ? "irs_audit" : "arbitration";

  const [mode, setMode] = useState(null); // always start at landing page
  const [acknowledged, setAcknowledged] = useState(false);
  const [step, setStep] = useState(1);
  const [matter, setMatter] = useState(saved.current?.matter || { name: "", client: "", type: defaultType, duration: "", jurisdiction: "", description: "", dealValue: "" });
  const [phases, setPhases] = useState(saved.current?.phases || buildPhases(defaultType, savedMode || "litigation"));
  const [timekeepers, setTimekeepers] = useState(saved.current?.timekeepers || []);
  const [contingency, setContingency] = useState(saved.current?.contingency ?? 100000);
  const [feeType, setFeeType] = useState(saved.current?.feeType || "hourly");
  const [caveats, setCaveats] = useState(saved.current?.caveats || (savedMode === "corporate" ? [...CORP_CAVEATS] : savedMode === "tax" ? [...TAX_CAVEATS] : [...DEFAULT_CAVEATS]));
  const [outputVersion, setOutputVersion] = useState("client");
  const [aiLoading, setAiLoading] = useState({});
  const [caveatsLoading, setCaveatsLoading] = useState(false);
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [summary, setSummary] = useState("");
  const modeLabels = mode === "corporate" ? CORP_MATTER_LABELS : mode === "tax" ? TAX_MATTER_LABELS : MATTER_LABELS;
  const [xlsxReady, setXlsxReady] = useState(false);
  const [newCaveat, setNewCaveat] = useState("");
  const [newTaskName, setNewTaskName] = useState({});
  const [timelineMode, setTimelineMode] = useState(saved.current?.timelineMode || "auto");
  const [phaseTimeline, setPhaseTimeline] = useState(saved.current?.phaseTimeline || {});

  // Persist session to localStorage on every meaningful change
  useEffect(() => {
    try {
      localStorage.setItem("lb_session", JSON.stringify({ mode, matter, phases, timekeepers, contingency, feeType, caveats, timelineMode, phaseTimeline }));
    } catch {
      // Persistence is best-effort in the baseline implementation.
    }
  }, [mode, matter, phases, timekeepers, contingency, feeType, caveats, timelineMode, phaseTimeline]);

  useEffect(() => {
    const sc = document.createElement("script");
    sc.src = "https://cdn.jsdelivr.net/npm/xlsx-js-style@1.2.0/dist/xlsx.bundle.js";
    sc.onload = () => setXlsxReady(true);
    document.head.appendChild(sc);
  }, []);

  // Reset everything when mode changes (but not on initial load from localStorage)
  const prevMode = useRef(mode);
  useEffect(() => {
    if (prevMode.current !== mode && mode !== null) {
      prevMode.current = mode;
      const dt = mode === "corporate" ? "ma_strategic" : mode === "tax" ? "irs_audit" : "arbitration";
      setMatter({ name: "", client: "", type: dt, duration: "", jurisdiction: "", description: "", dealValue: "" });
      setPhases(buildPhases(dt, mode));
      setTimekeepers([]);
      setContingency(100000);
      setFeeType("hourly");
      setCaveats(mode === "corporate" ? [...CORP_CAVEATS] : mode === "tax" ? [...TAX_CAVEATS] : [...DEFAULT_CAVEATS]);
      setStep(1);
    }
  }, [mode]);

  // Rebuild phases only when matter.type changes AFTER initial load
  const prevMatterType = useRef(matter.type);
  useEffect(() => {
    if (prevMatterType.current !== matter.type) {
      prevMatterType.current = matter.type;
      setPhases(buildPhases(matter.type, mode));
    }
  }, [matter.type, mode]);

  // ── Cost calculations ────────────────────────────────────────────────────

  const taskCost = (t) => {
    if (t.tkBreakdown && t.tkBreakdown.length > 0) {
      let low = 0, high = 0;
      t.tkBreakdown.forEach(b => {
        const tk = timekeepers.find(x => x.id === b.tkId);
        if (tk && tk.rate) {
          low  += (Number(b.hoursLow)  || 0) * Number(tk.rate);
          high += (Number(b.hoursHigh) || 0) * Number(tk.rate);
        }
      });
      return { low, high };
    }
    return { low: Number(t.low) || 0, high: Number(t.high) || 0 };
  };

  const totals = () => {
    let low = 0, high = 0;
    phases.forEach(p => {
      if (p.selected) p.tasks.forEach(t => {
        if (t.selected) { const c = taskCost(t); low += c.low; high += c.high; }
      });
    });
    return { low: low + (Number(contingency) || 0), high: high + (Number(contingency) || 0) };
  };

  // ── Timekeeper mutations ──────────────────────────────────────────────────

  const addTk = () => setTimekeepers(prev => [...prev, { id: uid(), name: "", title: "Partner", rate: "" }]);
  const removeTk = (id) => setTimekeepers(prev => prev.filter(t => t.id !== id));
  const updateTk = (id, field, val) => setTimekeepers(prev => prev.map(t => t.id === id ? { ...t, [field]: val } : t));

  // ── Phase/Task mutations ──────────────────────────────────────────────────

  const togglePhase = (pid) => setPhases(prev => prev.map(p => p.id===pid ? {...p, selected:!p.selected} : p));
  const toggleTask = (pid, tid) => setPhases(prev => prev.map(p => p.id!==pid ? p : {...p, tasks: p.tasks.map(t => t.id===tid ? {...t, selected:!t.selected} : t)}));
  const updateTask = (pid, tid, field, val) => setPhases(prev => prev.map(p => p.id!==pid ? p : {...p, tasks: p.tasks.map(t => t.id===tid ? {...t, [field]:val} : t)}));
  const removeTask = (pid, tid) => setPhases(prev => prev.map(p => p.id!==pid ? p : {...p, tasks: p.tasks.filter(t => t.id!==tid)}));
  const addTask = (pid) => {
    const name = (newTaskName[pid]||"").trim();
    if (!name) return;
    setPhases(prev => prev.map(p => p.id!==pid ? p : {...p, tasks: [...p.tasks, {id:uid(), name, note:"", selected:true, low:"", high:"", aiRationale:"", tkBreakdown:null}]}));
    setNewTaskName(prev => ({...prev, [pid]:""}));
  };
  const addPhase = () => {
    const name = prompt("Phase name:");
    if (!name) return;
    setPhases(prev => [...prev, {id:uid(), name, selected:true, tasks:[]}]);
  };

  // ── Timekeeper breakdown mutations ────────────────────────────────────────

  const enableBreakdown = (pid, tid) => {
    const initial = timekeepers.map(tk => ({ tkId: tk.id, hoursLow: "", hoursHigh: "" }));
    setPhases(prev => prev.map(p => p.id!==pid ? p : {
      ...p, tasks: p.tasks.map(t => t.id!==tid ? t : { ...t, tkBreakdown: initial })
    }));
  };
  const disableBreakdown = (pid, tid) => {
    setPhases(prev => prev.map(p => p.id!==pid ? p : {
      ...p, tasks: p.tasks.map(t => t.id!==tid ? t : { ...t, tkBreakdown: null })
    }));
  };
  const updateTaskTk = (pid, tid, tkId, field, val) => {
    setPhases(prev => prev.map(p => p.id!==pid ? p : {
      ...p, tasks: p.tasks.map(t => {
        if (t.id!==tid || !t.tkBreakdown) return t;
        return { ...t, tkBreakdown: t.tkBreakdown.map(b => b.tkId!==tkId ? b : { ...b, [field]: val }) };
      })
    }));
  };
  const addTkToTask = (pid, tid, tkId) => {
    setPhases(prev => prev.map(p => p.id!==pid ? p : {
      ...p, tasks: p.tasks.map(t => {
        if (t.id!==tid || !t.tkBreakdown) return t;
        if (t.tkBreakdown.find(b => b.tkId===tkId)) return t;
        return { ...t, tkBreakdown: [...t.tkBreakdown, { tkId, hoursLow: "", hoursHigh: "" }] };
      })
    }));
  };
  const removeTkFromTask = (pid, tid, tkId) => {
    setPhases(prev => prev.map(p => p.id!==pid ? p : {
      ...p, tasks: p.tasks.map(t => {
        if (t.id!==tid || !t.tkBreakdown) return t;
        return { ...t, tkBreakdown: t.tkBreakdown.filter(b => b.tkId!==tkId) };
      })
    }));
  };

  // ── AI ────────────────────────────────────────────────────────────────────

  const suggestAll = async () => {
    const allTasks = phases.flatMap(p => p.selected ? p.tasks.filter(t=>t.selected && !t.tkBreakdown).map(t=>({phaseId:p.id, taskId:t.id, phaseName:p.name, taskName:t.name})) : []);
    if (!allTasks.length) return;
    const loadMap = Object.fromEntries(allTasks.map(t=>[t.taskId,true]));
    setAiLoading(loadMap);
    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method:"POST", headers:{"Content-Type":"application/json"},
        body: JSON.stringify({
          model:"claude-sonnet-4-20250514", max_tokens:1000,
          messages:[{ role:"user", content:
            mode === "corporate"
              ? `You are an experienced transactional attorney. For a ${modeLabels[matter.type]} deal` +
                `${matter.jurisdiction ? `, governed by ${matter.jurisdiction} law` : ""}` +
                `${matter.dealValue ? `, deal value ${matter.dealValue}` : ""}` +
                `${matter.duration ? `, expected timeline ${matter.duration}` : ""}, provide realistic US law firm attorney fee estimates.\n` +
                `Return ONLY a JSON array, no other text or markdown. Each element: {"taskId":string,"low":number,"high":number,"rationale":string (max 12 words)}.\n\nTasks:\n` +
                allTasks.map(t=>`{"taskId":"${t.taskId}","phase":"${t.phaseName}","task":"${t.taskName}"}`).join("\n")
              : mode === "tax"
              ? `You are an experienced tax attorney. For a ${modeLabels[matter.type]} matter` +
                `${matter.jurisdiction ? ` (forum: ${matter.jurisdiction})` : ""}` +
                `${matter.dealValue ? `, tax years: ${matter.dealValue}` : ""}` +
                `${matter.duration ? `, estimated duration ${matter.duration}` : ""}, provide realistic US law firm attorney fee estimates.\n` +
                `Return ONLY a JSON array, no other text or markdown. Each element: {"taskId":string,"low":number,"high":number,"rationale":string (max 12 words)}.\n\nTasks:\n` +
                allTasks.map(t=>`{"taskId":"${t.taskId}","phase":"${t.phaseName}","task":"${t.taskName}"}`).join("\n")
              : `You are an experienced litigation partner. For a ${modeLabels[matter.type]} matter` +
                `${matter.jurisdiction ? ` in ${matter.jurisdiction}` : ""}` +
                `, estimated duration ${matter.duration} months, provide realistic US law firm attorney fee estimates.\n` +
                `Return ONLY a JSON array, no other text or markdown. Each element: {"taskId":string,"low":number,"high":number,"rationale":string (max 12 words)}.\n\nTasks:\n` +
                allTasks.map(t=>`{"taskId":"${t.taskId}","phase":"${t.phaseName}","task":"${t.taskName}"}`).join("\n")
          }]
        })
      });
      const data = await res.json();
      const raw = data.content?.[0]?.text || "[]";
      const suggestions = JSON.parse(raw.replace(/```json|```/g,"").trim());
      setPhases(prev => prev.map(p => ({...p, tasks: p.tasks.map(t => {
        const sg = suggestions.find(sg=>sg.taskId===t.id);
        return sg ? {...t, low:sg.low, high:sg.high, aiRationale:sg.rationale} : t;
      })})));
    } catch(e) { console.error(e); }
    setAiLoading({});
  };

  const suggestOne = async (pid, tid) => {
    setAiLoading(prev=>({...prev,[tid]:true}));
    const phase = phases.find(p=>p.id===pid);
    const task = phase?.tasks.find(t=>t.id===tid);
    if (!task) return;
    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method:"POST", headers:{"Content-Type":"application/json"},
        body: JSON.stringify({
          model:"claude-sonnet-4-20250514", max_tokens:200,
          messages:[{ role:"user", content:
            mode === "corporate"
              ? `For a ${modeLabels[matter.type]} deal${matter.jurisdiction?`, governed by ${matter.jurisdiction} law`:""}${matter.dealValue?`, deal value ${matter.dealValue}`:""}, estimate US law firm attorney fees for: "${task.name}" (phase: ${phase.name}). Return ONLY JSON: {"low":number,"high":number,"rationale":string (max 12 words)}. No other text.`
              : mode === "tax"
              ? `For a ${modeLabels[matter.type]} matter${matter.jurisdiction?` (forum: ${matter.jurisdiction})`:""}${matter.dealValue?`, tax years: ${matter.dealValue}`:""}, estimate US law firm tax attorney fees for: "${task.name}" (phase: ${phase.name}). Return ONLY JSON: {"low":number,"high":number,"rationale":string (max 12 words)}. No other text.`
              : `For a ${modeLabels[matter.type]} matter${matter.jurisdiction?` in ${matter.jurisdiction}`:""}, estimate US law firm attorney fees for: "${task.name}" (phase: ${phase.name}). Return ONLY JSON: {"low":number,"high":number,"rationale":string (max 12 words)}. No other text.`
          }]
        })
      });
      const data = await res.json();
      const sg = JSON.parse((data.content?.[0]?.text||"{}").replace(/```json|```/g,"").trim());
      setPhases(prev=>prev.map(p=>p.id!==pid?p:{...p, tasks:p.tasks.map(t=>t.id!==tid?t:{...t,low:sg.low,high:sg.high,aiRationale:sg.rationale})}));
    } catch(e) { console.error(e); }
    setAiLoading(prev=>({...prev,[tid]:false}));
  };

  const generateCaveats = async () => {
    setCaveatsLoading(true);
    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method:"POST", headers:{"Content-Type":"application/json"},
        body: JSON.stringify({
          model:"claude-sonnet-4-20250514", max_tokens:700,
          messages:[{ role:"user", content:
            `You are a legal billing expert. Generate 6 specific, accurate fee budget caveats for a ${modeLabels[matter.type]} matter` +
            `${matter.jurisdiction ? ` (${matter.jurisdiction})` : ""}. ` +
            `Fee arrangement: ${FEE_TYPES.find(f=>f.v===feeType)?.l || feeType}. ` +
            `Return ONLY a JSON array of strings. No other text or markdown.`
          }]
        })
      });
      const data = await res.json();
      const raw = data.content?.[0]?.text || "[]";
      const generated = JSON.parse(raw.replace(/```json|```/g,"").trim());
      if (Array.isArray(generated)) setCaveats(generated);
    } catch(e) { console.error(e); }
    setCaveatsLoading(false);
  };

  const generateSummary = async () => {
    setSummaryLoading(true);
    const T = totals();
    const phaseBreakdown = phases
      .filter(p=>p.selected)
      .map(p => {
        const tasks = p.tasks.filter(t=>t.selected);
        const pc = tasks.reduce((a,t)=>{ const c=taskCost(t); return {low:a.low+c.low,high:a.high+c.high}; }, {low:0,high:0});
        return pc.low||pc.high ? `${p.name}: ${fmt(pc.low)}–${fmt(pc.high)}` : null;
      })
      .filter(Boolean)
      .join("; ");
    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method:"POST", headers:{"Content-Type":"application/json"},
        body: JSON.stringify({
          model:"claude-sonnet-4-20250514", max_tokens:300,
          messages:[{ role:"user", content:
            `Write a 2–3 sentence professional budget narrative for a ${modeLabels[matter.type]} matter. ` +
            `Total fee estimate: ${fmt(T.low)} – ${fmt(T.high)}. ` +
            (phaseBreakdown ? `Phase breakdown: ${phaseBreakdown}. ` : "") +
            `Fee arrangement: ${FEE_TYPES.find(f=>f.v===feeType)?.l || feeType}. ` +
            `Write from the law firm's perspective. Do not include any client name or matter name. ` +
            `Return only the summary paragraph, no quotes or labels.`
          }]
        })
      });
      const data = await res.json();
      setSummary(data.content?.[0]?.text?.trim() || "");
    } catch(e) { console.error(e); }
    setSummaryLoading(false);
  };

  // ── Excel Export ──────────────────────────────────────────────────────────

  const exportExcel = () => {
    if (!window.XLSX) return;
    const XLSX = window.XLSX;
    const wb = XLSX.utils.book_new();
    const ws = {};
    const merges = [];
    const CURR = '"$"#,##0';
    const isInternal = outputVersion === "internal";

    // ── Style palette ──────────────────────────────────────────────────────
    const NAVY   = "1B2B4B";
    const BLUE   = "2B5BA8";
    const LBLUE  = "E8EDF7";
    const LGRAY  = "F5F4F0";
    const WHITE  = "FFFFFF";
    const DGRAY  = "444444";
    const MGRAY  = "888888";
    const GOLD   = "C8A84B";

    const font  = (bold, sz, color) => ({ bold: !!bold, sz: sz || 11, color: { rgb: color || "000000" } });
    const fill  = (rgb) => ({ patternType: "solid", fgColor: { rgb } });
    const alignL = { horizontal: "left",  vertical: "center" };
    const alignR = { horizontal: "right", vertical: "center" };
    const alignC = { horizontal: "center",vertical: "center" };
    const bdrAll = (rgb = "CCCCCC") => ({ top:{style:"thin",color:{rgb}}, bottom:{style:"thin",color:{rgb}}, left:{style:"thin",color:{rgb}}, right:{style:"thin",color:{rgb}} });
    // Set a cell with value + optional style
    const sc = (col, row, val, fmt, formula, style) => {
      const ref = `${col}${row}`;
      if (formula) {
        ws[ref] = { t: "n", f: formula, v: typeof val === "number" ? val : 0 };
      } else if (typeof val === "number") {
        ws[ref] = { t: "n", v: val };
      } else if (val != null && val !== "") {
        ws[ref] = { t: "s", v: String(val) };
      } else {
        ws[ref] = { t: "s", v: "" };
      }
      if (fmt && ws[ref]) ws[ref].z = fmt;
      if (style && ws[ref]) ws[ref].s = style;
    };

    // Style every cell in a row across cols A–E
    const styleRow = (row, style) => {
      ["A","B","C","D","E"].forEach(col => {
        const ref = `${col}${row}`;
        if (!ws[ref]) ws[ref] = { t: "s", v: "" };
        ws[ref].s = style;
      });
    };

    const mergeRow = (row) => merges.push({ s: { r: row-1, c: 0 }, e: { r: row-1, c: 4 } });

    let r = 1;

    // ── Title ──────────────────────────────────────────────────────────────
    const title = [matter.client, matter.name].filter(Boolean).join("  —  ") || "Litigation Budget";
    sc("A", r, title, null, null, { font: font(true, 16, WHITE), fill: fill(NAVY), alignment: alignL });
    mergeRow(r);
    styleRow(r, { font: font(true, 16, WHITE), fill: fill(NAVY), alignment: alignL });
    ws[`!rows`] = ws[`!rows`] || [];
    ws[`!rows`][r-1] = { hpt: 28 };
    r++;

    const subtitle = `${modeLabels[matter.type]}${matter.jurisdiction ? "  |  " + matter.jurisdiction : ""}${matter.duration ? "  |  " + (mode === "corporate" ? "Timeline: " : "Duration: ") + matter.duration : ""}${matter.dealValue ? "  |  " + (mode === "tax" ? "Tax years: " : "Deal value: ") + matter.dealValue : ""}`;
    sc("A", r, subtitle, null, null, { font: font(false, 11, WHITE), fill: fill(BLUE), alignment: alignL });
    mergeRow(r);
    styleRow(r, { font: font(false, 11, WHITE), fill: fill(BLUE), alignment: alignL });
    r++;

    sc("A", r, "Generated: " + new Date().toLocaleDateString(), null, null, { font: font(false, 10, MGRAY), fill: fill(LGRAY), alignment: alignL });
    mergeRow(r);
    styleRow(r, { font: font(false, 10, MGRAY), fill: fill(LGRAY), alignment: alignL });
    r++;
    r++; // blank

    // ── Timekeepers ────────────────────────────────────────────────────────
    if (timekeepers.length > 0) {
      sc("A", r, "TEAM / TIMEKEEPERS", null, null, { font: font(true, 11, WHITE), fill: fill(BLUE), alignment: alignL });
      mergeRow(r);
      styleRow(r, { font: font(true, 11, WHITE), fill: fill(BLUE), alignment: alignL });
      r++;

      const hdrStyle = { font: font(true, 10, DGRAY), fill: fill(LGRAY), alignment: alignL, border: bdrAll() };
      sc("A", r, "Name",        null, null, hdrStyle);
      sc("B", r, "Title",       null, null, hdrStyle);
      sc("C", r, "Rate ($/hr)", null, null, hdrStyle);
      sc("D", r, "", null, null, hdrStyle);
      sc("E", r, "", null, null, hdrStyle);
      r++;

      timekeepers.forEach((tk, i) => {
        const rowStyle = { font: font(false, 10), fill: fill(i % 2 === 0 ? WHITE : "F9F8F5"), border: bdrAll() };
        sc("A", r, tk.name || "—", null, null, rowStyle);
        sc("B", r, tk.title,       null, null, rowStyle);
        sc("C", r, tk.rate ? Number(tk.rate) : null, CURR, null, rowStyle);
        sc("D", r, "", null, null, rowStyle);
        sc("E", r, "", null, null, rowStyle);
        r++;
      });
      r++;
    }

    // ── Budget table header ────────────────────────────────────────────────
    sc("A", r, "BUDGET ESTIMATE", null, null, { font: font(true, 11, WHITE), fill: fill(BLUE), alignment: alignL });
    mergeRow(r);
    styleRow(r, { font: font(true, 11, WHITE), fill: fill(BLUE), alignment: alignL });
    r++;

    const colHdrStyle = { font: font(true, 10, WHITE), fill: fill(NAVY), alignment: alignC, border: bdrAll(NAVY) };
    sc("A", r, "ITEM",              null, null, { ...colHdrStyle, alignment: alignL });
    sc("B", r, "LOW",               null, null, colHdrStyle);
    sc("C", r, "HIGH",              null, null, colHdrStyle);
    sc("D", r, "NOTES",             null, null, colHdrStyle);
    sc("E", r, isInternal ? "TIMEKEEPER DETAIL" : "", null, null, colHdrStyle);
    r++;

    const subtotalBRefs = [];
    const subtotalCRefs = [];

    phases.filter(p => p.selected).forEach(p => {
      const tasks = p.tasks.filter(t => t.selected);
      if (!tasks.length) return;

      // Phase header
      sc("A", r, p.name.toUpperCase(), null, null, { font: font(true, 11, NAVY), fill: fill(LBLUE), alignment: alignL, border: { ...bdrAll("BBCCEE"), bottom:{style:"medium",color:{rgb:BLUE}} } });
      mergeRow(r);
      styleRow(r, { font: font(true, 11, NAVY), fill: fill(LBLUE), alignment: alignL, border: bdrAll("BBCCEE") });
      r++;

      const bodyStart = r;
      let taskRowIdx = 0;

      tasks.forEach(t => {
        const { low: lo, high: hi } = taskCost(t);
        const note = [t.note, isInternal && t.aiRationale ? `AI: ${t.aiRationale}` : ""].filter(Boolean).join(" | ");
        const rowFill = fill(taskRowIdx % 2 === 0 ? WHITE : "FAFAF8");
        const taskStyle    = { font: font(false, 10), fill: rowFill, border: bdrAll() };
        const numStyle     = { font: font(false, 10), fill: rowFill, alignment: alignR, border: bdrAll() };
        const noteStyle    = { font: font(false, 9, MGRAY), fill: rowFill, border: bdrAll() };

        sc("A", r, `  ${t.name}${t.note ? ` [${t.note}]` : ""}`, null, null, taskStyle);
        sc("B", r, lo || 0, CURR, null, numStyle);
        sc("C", r, hi || 0, CURR, null, numStyle);
        sc("D", r, note || "", null, null, noteStyle);

        if (t.tkBreakdown && t.tkBreakdown.length > 0) {
          const detail = t.tkBreakdown.map(b => {
            const tk = timekeepers.find(x => x.id === b.tkId);
            return tk ? `${tk.name || tk.title}: ${b.hoursLow||0}–${b.hoursHigh||0}h` : null;
          }).filter(Boolean).join("; ");
          sc("E", r, detail || "", null, null, noteStyle);
        } else {
          sc("E", r, "", null, null, noteStyle);
        }
        r++;
        taskRowIdx++;

        // Internal breakdown sub-rows
        if (isInternal && t.tkBreakdown) {
          t.tkBreakdown.forEach(b => {
            const tk = timekeepers.find(x => x.id === b.tkId);
            if (!tk) return;
            const bLo = (Number(b.hoursLow)||0) * (Number(tk.rate)||0);
            const bHi = (Number(b.hoursHigh)||0) * (Number(tk.rate)||0);
            const subFill = fill("F3F2EE");
            const subStyle = { font: font(false, 9, MGRAY), fill: subFill, border: bdrAll("DDDDDD") };
            const subNumStyle = { font: font(false, 9, MGRAY), fill: subFill, alignment: alignR, border: bdrAll("DDDDDD") };
            sc("A", r, `    ↳ ${tk.name||"—"} (${tk.title}) · ${b.hoursLow||0}–${b.hoursHigh||0}h @ $${Number(tk.rate||0).toLocaleString()}/hr`, null, null, subStyle);
            sc("B", r, "", null, null, subStyle);
            sc("C", r, "", null, null, subStyle);
            sc("D", r, bLo || 0, CURR, null, subNumStyle);
            sc("E", r, bHi || 0, CURR, null, subNumStyle);
            r++;
          });
        }
      });

      const bodyEnd = r - 1;
      const pLo = tasks.reduce((a, t) => a + taskCost(t).low, 0);
      const pHi = tasks.reduce((a, t) => a + taskCost(t).high, 0);

      // Subtotal row
      const subStyle = { font: font(true, 10, NAVY), fill: fill(LGRAY), alignment: alignL, border: { ...bdrAll("CCCCCC"), top:{style:"medium",color:{rgb:NAVY}}, bottom:{style:"medium",color:{rgb:NAVY}} } };
      const subNumStyle = { font: font(true, 10, NAVY), fill: fill(LGRAY), alignment: alignR, border: { ...bdrAll("CCCCCC"), top:{style:"medium",color:{rgb:NAVY}}, bottom:{style:"medium",color:{rgb:NAVY}} } };
      sc("A", r, `  ${p.name} Subtotal`, null, null, subStyle);
      sc("B", r, pLo, CURR, `SUM(B${bodyStart}:B${bodyEnd})`, subNumStyle);
      sc("C", r, pHi, CURR, `SUM(C${bodyStart}:C${bodyEnd})`, subNumStyle);
      sc("D", r, "", null, null, subStyle);
      sc("E", r, "", null, null, subStyle);
      subtotalBRefs.push(`B${r}`);
      subtotalCRefs.push(`C${r}`);
      r++;
      r++; // blank
    });

    // ── Contingency ────────────────────────────────────────────────────────
    const cont = Number(contingency) || 0;
    const contStyle    = { font: font(false, 10, DGRAY), fill: fill("FAFAF8"), border: bdrAll() };
    const contNumStyle = { font: font(false, 10, DGRAY), fill: fill("FAFAF8"), alignment: alignR, border: bdrAll() };
    sc("A", r, "Contingency",                null, null, contStyle);
    sc("B", r, cont, CURR, null,             contNumStyle);
    sc("C", r, cont, CURR, null,             contNumStyle);
    sc("D", r, "Unpredicted events / reserve", null, null, { ...contStyle, font: font(false, 9, MGRAY) });
    sc("E", r, "", null, null, contStyle);
    const contRow = r;
    r++;

    // ── Grand total ────────────────────────────────────────────────────────
    const { low: totalLo, high: totalHi } = totals();
    const totalBFormula = subtotalBRefs.length ? `${subtotalBRefs.join("+")}+B${contRow}` : `B${contRow}`;
    const totalCFormula = subtotalCRefs.length ? `${subtotalCRefs.join("+")}+C${contRow}` : `C${contRow}`;
    const totStyle    = { font: font(true, 12, WHITE), fill: fill(NAVY), alignment: alignL, border: bdrAll(NAVY) };
    const totNumStyle = { font: font(true, 12, GOLD),  fill: fill(NAVY), alignment: alignR, border: bdrAll(NAVY) };
    sc("A", r, "TOTAL ESTIMATE",   null, null, totStyle);
    sc("B", r, totalLo, CURR, totalBFormula, totNumStyle);
    sc("C", r, totalHi, CURR, totalCFormula, totNumStyle);
    sc("D", r, "", null, null, totStyle);
    sc("E", r, "", null, null, totStyle);
    ws[`!rows`] = ws[`!rows`] || [];
    ws[`!rows`][r-1] = { hpt: 24 };
    r++;
    r++;

    // ── Caveats ────────────────────────────────────────────────────────────
    if (caveats.length > 0) {
      sc("A", r, "CAVEATS AND EXCLUSIONS", null, null, { font: font(true, 10, WHITE), fill: fill(BLUE), alignment: alignL });
      mergeRow(r);
      styleRow(r, { font: font(true, 10, WHITE), fill: fill(BLUE), alignment: alignL });
      r++;
      caveats.forEach((c, i) => {
        sc("A", r, `${i+1}.  ${c}`, null, null, { font: font(false, 9, DGRAY), fill: fill(i%2===0?WHITE:"F9F8F5"), alignment: alignL });
        mergeRow(r);
        styleRow(r, { font: font(false, 9, DGRAY), fill: fill(i%2===0?WHITE:"F9F8F5") });
        r++;
      });
    }

    ws["!ref"]    = `A1:E${r}`;
    ws["!merges"] = merges;
    ws["!cols"]   = [ { wch: 56 }, { wch: 16 }, { wch: 16 }, { wch: 38 }, { wch: 36 } ];

    XLSX.utils.book_append_sheet(wb, ws, "Budget");
    const filename = `${(matter.name || "budget").replace(/\s+/g, "_")}_budget.xlsx`;
    XLSX.writeFile(wb, filename);
  };

  // ── Render Steps ──────────────────────────────────────────────────────────

  const Step1 = () => (
    <div>
      <div style={s.card}>
        <div style={s.sectionTitle}>{mode === "corporate" ? "Deal Information" : mode === "tax" ? "Tax Matter Information" : "Matter Information"}</div>
        <div style={s.row2}>
          <div>
            <label style={s.label}>{mode === "corporate" ? "Deal Name" : "Matter Name"}</label>
            <input style={s.input} value={matter.name} onChange={e=>setMatter({...matter,name:e.target.value})} placeholder={mode === "corporate" ? "e.g. Project Falcon" : mode === "tax" ? "e.g. Smith IRS Audit" : "e.g. Smith v. Jones"} />
          </div>
          <div>
            <label style={s.label}>Client</label>
            <input style={s.input} value={matter.client} onChange={e=>setMatter({...matter,client:e.target.value})} placeholder="Client name" />
          </div>
        </div>
        {mode === "tax" ? (
          <>
            <div style={s.row2}>
              <div>
                <label style={s.label}>Matter Type</label>
                <select style={s.select} value={matter.type} onChange={e=>setMatter({...matter,type:e.target.value})}>
                  {Object.entries(TAX_MATTER_LABELS).map(([v,l])=><option key={v} value={v}>{l}</option>)}
                </select>
              </div>
              <div>
                <label style={s.label}>Forum / Jurisdiction</label>
                <input style={s.input} value={matter.jurisdiction} onChange={e=>setMatter({...matter,jurisdiction:e.target.value})} placeholder="e.g. IRS – Large Business Division, U.S. Tax Court, CA FTB" />
              </div>
            </div>
            <div style={s.row2}>
              <div>
                <label style={s.label}>Tax Years at Issue</label>
                <input style={s.input} value={matter.dealValue||""} onChange={e=>setMatter({...matter,dealValue:e.target.value})} placeholder="e.g. 2019–2022" />
              </div>
              <div>
                <label style={s.label}>Expected Duration</label>
                <input style={s.input} value={matter.duration} onChange={e=>setMatter({...matter,duration:e.target.value})} placeholder="e.g. 12-18 months" />
              </div>
            </div>
            <div style={s.fieldWrap}>
              <label style={s.label}>Brief Description (optional)</label>
              <input style={s.input} value={matter.description} onChange={e=>setMatter({...matter,description:e.target.value})} placeholder="One-line description" />
            </div>
          </>
        ) : mode === "corporate" ? (
          <>
            <div style={s.row2}>
              <div>
                <label style={s.label}>Deal Type</label>
                <select style={s.select} value={matter.type} onChange={e=>setMatter({...matter,type:e.target.value})}>
                  {Object.entries(CORP_MATTER_LABELS).map(([v,l])=><option key={v} value={v}>{l}</option>)}
                </select>
              </div>
              <div>
                <label style={s.label}>Governing Law</label>
                <select style={{...s.select,marginBottom:4}} value={matter.jurisdiction} onChange={e=>{if(e.target.value) setMatter({...matter,jurisdiction:e.target.value})}}>
                  <option value="">— Select governing law —</option>
                  {CORP_GOVERNING_LAW.map(g=><option key={g} value={g}>{g}</option>)}
                </select>
                <input style={{...s.input,fontSize:12}} value={matter.jurisdiction} onChange={e=>setMatter({...matter,jurisdiction:e.target.value})} placeholder="Edit or enter governing law" />
              </div>
            </div>
            <div style={s.row2}>
              <div>
                <label style={s.label}>Deal Value</label>
                <select style={s.select} value={matter.dealValue||""} onChange={e=>setMatter({...matter,dealValue:e.target.value})}>
                  <option value="">— Select range —</option>
                  {DEAL_VALUES.map(v=><option key={v} value={v}>{v}</option>)}
                </select>
              </div>
              <div>
                <label style={s.label}>Expected Timeline</label>
                <input style={s.input} value={matter.duration} onChange={e=>setMatter({...matter,duration:e.target.value})} placeholder="e.g. 3-6 months" />
              </div>
            </div>
            <div style={s.fieldWrap}>
              <label style={s.label}>Brief Description (optional)</label>
              <input style={s.input} value={matter.description} onChange={e=>setMatter({...matter,description:e.target.value})} placeholder="One-line description" />
            </div>
          </>
        ) : (
          <>
            <div style={s.row2}>
              <div>
                <label style={s.label}>Matter Type</label>
                <select style={s.select} value={matter.type} onChange={e=>setMatter({...matter,type:e.target.value})}>
                  {Object.entries(MATTER_LABELS).map(([v,l])=><option key={v} value={v}>{l}</option>)}
                </select>
              </div>
              <div>
                <label style={s.label}>Jurisdiction</label>
                {matter.type === "federal" ? (
                  <>
                    <select style={{...s.select,marginBottom:4}} value={matter.jurisdiction} onChange={e=>{if(e.target.value) setMatter({...matter,jurisdiction:e.target.value})}}>
                      <option value="">— Select court —</option>
                      {FEDERAL_COURTS.map(g=>(
                        <optgroup key={g.circuit} label={g.circuit}>
                          {g.courts.map(c=><option key={c} value={c}>{c}</option>)}
                        </optgroup>
                      ))}
                    </select>
                    <input style={{...s.input,fontSize:12}} value={matter.jurisdiction} onChange={e=>setMatter({...matter,jurisdiction:e.target.value})} placeholder="Edit or enter custom court name" />
                  </>
                ) : matter.type === "state" ? (
                  <>
                    <select style={{...s.select,marginBottom:4}} value={matter.jurisdiction} onChange={e=>{if(e.target.value) setMatter({...matter,jurisdiction:e.target.value})}}>
                      <option value="">— Select court —</option>
                      {STATE_COURTS.map(g=>(
                        <optgroup key={g.state} label={g.state}>
                          {g.courts.map(c=><option key={c} value={`${g.state} – ${c}`}>{g.state} – {c}</option>)}
                        </optgroup>
                      ))}
                    </select>
                    <input style={{...s.input,fontSize:12}} value={matter.jurisdiction} onChange={e=>setMatter({...matter,jurisdiction:e.target.value})} placeholder="Edit or enter custom court name" />
                  </>
                ) : matter.type === "arbitration" ? (
                  <>
                    <select style={{...s.select,marginBottom:4}} value={matter.jurisdiction} onChange={e=>{if(e.target.value) setMatter({...matter,jurisdiction:e.target.value})}}>
                      <option value="">— Select forum —</option>
                      {ARBITRATION_FORA.map(g=>(
                        <optgroup key={g.provider} label={g.provider}>
                          {g.forums.map(f=><option key={f} value={f}>{f}</option>)}
                        </optgroup>
                      ))}
                    </select>
                    <input style={{...s.input,fontSize:12}} value={matter.jurisdiction} onChange={e=>setMatter({...matter,jurisdiction:e.target.value})} placeholder="Edit or enter custom forum name" />
                  </>
                ) : matter.type === "regulatory" ? (
                  <>
                    <select style={{...s.select,marginBottom:4}} value={matter.jurisdiction} onChange={e=>{if(e.target.value) setMatter({...matter,jurisdiction:e.target.value})}}>
                      <option value="">— Select agency / body —</option>
                      {REGULATORY_FORA.map(g=>(
                        <optgroup key={g.agency} label={g.agency}>
                          {g.bodies.map(b=><option key={b} value={b}>{b}</option>)}
                        </optgroup>
                      ))}
                    </select>
                    <input style={{...s.input,fontSize:12}} value={matter.jurisdiction} onChange={e=>setMatter({...matter,jurisdiction:e.target.value})} placeholder="Edit or enter custom agency name" />
                  </>
                ) : (
                  <input style={s.input} value={matter.jurisdiction} onChange={e=>setMatter({...matter,jurisdiction:e.target.value})} placeholder="e.g. Jurisdiction / forum" />
                )}
              </div>
            </div>
            <div style={s.row2}>
              <div>
                <label style={s.label}>Expected Duration</label>
                <input style={s.input} value={matter.duration} onChange={e=>setMatter({...matter,duration:e.target.value})} placeholder="e.g. 18-24 months" />
              </div>
              <div>
                <label style={s.label}>Brief Description (optional)</label>
                <input style={s.input} value={matter.description} onChange={e=>setMatter({...matter,description:e.target.value})} placeholder="One-line description" />
              </div>
            </div>
          </>
        )}
      </div>

      {/* Timekeepers */}
      <div style={s.card}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
          <div style={{...s.sectionTitle,marginBottom:0}}>
            Team / Timekeepers
            <span style={{fontSize:10,fontWeight:400,color:MUTED,textTransform:"none",letterSpacing:0,marginLeft:6}}>(optional — enables hour-based cost calculation in Step 3)</span>
          </div>
          <button style={s.btnSmall} onClick={addTk}>+ Add</button>
        </div>

        {timekeepers.length === 0 ? (
          <div style={{fontSize:12,fontFamily:"sans-serif",color:MUTED,fontStyle:"italic",padding:"8px 0"}}>
            No timekeepers added. Add team members to calculate costs from hours × rate.
          </div>
        ) : (
          <>
            {/* Column headers */}
            <div style={{display:"grid",gridTemplateColumns:"2fr 1.4fr 1fr 28px",gap:10,marginBottom:6,paddingBottom:6,borderBottom:`1px solid ${BORDER}`}}>
              <div style={s.bdColHdr}>Name</div>
              <div style={s.bdColHdr}>Title</div>
              <div style={s.bdColHdr}>Rate ($/hr)</div>
              <div></div>
            </div>
            {timekeepers.map(tk => (
              <div key={tk.id} style={{display:"grid",gridTemplateColumns:"2fr 1.4fr 1fr 28px",gap:10,alignItems:"center",marginBottom:8}}>
                <input
                  style={s.input}
                  placeholder="e.g. J. Smith"
                  value={tk.name}
                  onChange={e=>updateTk(tk.id,"name",e.target.value)}
                />
                <select
                  style={s.select}
                  value={tk.title}
                  onChange={e=>updateTk(tk.id,"title",e.target.value)}
                >
                  {TITLES.map(t=><option key={t} value={t}>{t}</option>)}
                </select>
                <input
                  style={{...s.input,textAlign:"right"}}
                  placeholder="e.g. 500"
                  value={tk.rate}
                  onChange={e=>updateTk(tk.id,"rate",e.target.value.replace(/[^0-9]/g,""))}
                />
                <button onClick={()=>removeTk(tk.id)} style={{background:"none",border:"none",cursor:"pointer",color:"#ccc",fontSize:18,padding:0,lineHeight:1,textAlign:"center"}}>×</button>
              </div>
            ))}
          </>
        )}
      </div>

      {/* AI Budget Assistant – Coming Soon */}
      <div style={{...s.card, opacity:0.55, pointerEvents:"none", position:"relative", overflow:"hidden"}}>
        <div style={{position:"absolute",top:10,right:12,background:"#e8edf5",color:MUTED,fontSize:10,fontFamily:"sans-serif",fontWeight:700,letterSpacing:"0.07em",textTransform:"uppercase",padding:"3px 9px",borderRadius:10}}>Coming Soon</div>
        <div style={{...s.sectionTitle,marginBottom:4}}>✦ AI Budget Assistant</div>
        <div style={{fontSize:12,fontFamily:"sans-serif",color:MUTED,marginBottom:14,lineHeight:1.6}}>
          Describe the matter in plain language. The assistant will suggest phases, tasks, and fee ranges using matter type, jurisdiction, team roles and rates, and anonymized scope details — no client or identifying information required.
        </div>
        <div style={s.fieldWrap}>
          <label style={s.label}>Describe the matter (scope, complexity, key issues — anonymized)</label>
          <textarea
            disabled
            rows={4}
            style={{...s.input, width:"100%", resize:"vertical", background:"#f4f6fa", color:MUTED, fontFamily:"sans-serif", fontSize:13, lineHeight:1.6}}
            placeholder="e.g. Contract dispute, $4M in alleged damages, contested discovery expected, expert witnesses on both sides, likely summary judgment motions before trial. Mid-size team: partner, two associates, paralegal."
          />
        </div>
        <button disabled style={{...s.btn, marginTop:4, background:"#b0b8c9", cursor:"not-allowed"}}>Generate Budget with AI</button>
      </div>
    </div>
  );

  const Step2 = () => (
    <div>
      <div style={s.card}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
          <div style={s.sectionTitle}>Phases and Tasks</div>
          <button style={s.btnSmall} onClick={addPhase}>+ Add Phase</button>
        </div>
        <div style={{fontSize:12,fontFamily:"sans-serif",color:MUTED,marginBottom:20}}>
          Default library for <strong style={{color:N}}>{modeLabels[matter.type]}</strong>. Uncheck phases or tasks to exclude. Add custom tasks per phase.
        </div>
        {phases.map(p => (
          <div key={p.id} style={{marginBottom:20}}>
            <div style={s.phaseHeader}>
              <label style={{display:"flex",alignItems:"center",gap:8,cursor:"pointer"}}>
                <input type="checkbox" checked={p.selected} onChange={()=>togglePhase(p.id)} style={{accentColor:ACCENT}} />
                <span style={s.phaseLabel}>{p.name}</span>
              </label>
            </div>
            {p.selected && (
              <>
                {p.tasks.map(t => (
                  <div key={t.id} style={s.taskRow}>
                    <input type="checkbox" checked={t.selected} onChange={()=>toggleTask(p.id,t.id)} style={{accentColor:ACCENT,flexShrink:0}} />
                    <span style={s.taskName}>{t.name} {t.note && <span style={s.taskNote}>[{t.note}]</span>}</span>
                    <button onClick={()=>removeTask(p.id,t.id)} style={{background:"none",border:"none",cursor:"pointer",color:"#ccc",fontSize:16,padding:"0 4px",lineHeight:1}}>×</button>
                  </div>
                ))}
                <div style={{display:"flex",gap:8,marginTop:8,paddingLeft:24}}>
                  <input style={{...s.input,fontSize:12,padding:"5px 10px"}} placeholder="Add task..." value={newTaskName[p.id]||""} onChange={e=>setNewTaskName(prev=>({...prev,[p.id]:e.target.value}))} onKeyDown={e=>e.key==="Enter"&&addTask(p.id)} />
                  <button style={s.btnSmall} onClick={()=>addTask(p.id)}>Add</button>
                </div>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );

  const Step3 = () => {
    const anyLoading = Object.values(aiLoading).some(Boolean);
    const hasTks = timekeepers.length > 0;
    return (
      <div>
        <div style={s.card}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
            <div style={s.sectionTitle}>Cost Ranges</div>
            <button style={s.btnAI} onClick={suggestAll} disabled={anyLoading}>
              {anyLoading ? "Suggesting..." : "✦ Suggest All Ranges"}
            </button>
          </div>
          <div style={{fontSize:12,fontFamily:"sans-serif",color:MUTED,marginBottom:20}}>
            Enter low / high dollar estimates per task, or use AI suggestions.
            {hasTks && <span style={{color:ACCENT}}> Click <strong>÷ hrs</strong> on any task to break down by timekeeper hours × rate.</span>}
            {!hasTks && <span> <button style={{background:"none",border:"none",padding:0,color:ACCENT,cursor:"pointer",fontFamily:"sans-serif",fontSize:12,textDecoration:"underline"}} onClick={()=>setStep(1)}>Add timekeepers in Step 1</button> to enable hour-based cost breakdown.</span>}
          </div>

          {phases.filter(p=>p.selected).map(p => (
            <div key={p.id} style={s.previewPhase}>
              <div style={{...s.previewPhaseName,fontSize:12,color:N,fontWeight:700,marginBottom:8}}>{p.name}</div>

              {p.tasks.filter(t=>t.selected).map(t => {
                const hasBreakdown = !!t.tkBreakdown;
                const cost = taskCost(t);
                const hasRates = timekeepers.some(tk => tk.rate);

                return (
                  <div key={t.id} style={{borderBottom:`1px solid #f0efeb`,padding:"8px 0"}}>
                    {/* Main task row */}
                    <div style={{display:"flex",alignItems:"flex-start",gap:10}}>
                      <div style={{flex:1,paddingTop:2}}>
                        <div style={{fontSize:13,fontFamily:"sans-serif",color:TEXT}}>
                          {t.name} {t.note&&<span style={s.taskNote}>[{t.note}]</span>}
                        </div>
                        {t.aiRationale && <div style={s.rationale}>✦ {t.aiRationale}</div>}
                      </div>

                      <div style={{display:"flex",gap:6,alignItems:"center",flexShrink:0}}>
                        {hasBreakdown ? (
                          /* Calculated cost display */
                          <div style={{minWidth:200,textAlign:"right",fontSize:13,fontFamily:"sans-serif",fontWeight:600,color:cost.low||cost.high ? ACCENT : MUTED}}>
                            {cost.low||cost.high ? `${fmt(cost.low)} — ${fmt(cost.high)}` : <span style={{fontWeight:400,fontStyle:"italic"}}>enter hours below</span>}
                          </div>
                        ) : (
                          /* Manual dollar inputs */
                          <>
                            <input style={s.moneyInput} placeholder="Low $" value={t.low} onChange={e=>updateTask(p.id,t.id,"low",e.target.value.replace(/[^0-9]/g,""))} />
                            <input style={s.moneyInput} placeholder="High $" value={t.high} onChange={e=>updateTask(p.id,t.id,"high",e.target.value.replace(/[^0-9]/g,""))} />
                            <button style={{...s.btnSmall,padding:"5px 8px",fontSize:10,whiteSpace:"nowrap"}} onClick={()=>suggestOne(p.id,t.id)} disabled={!!aiLoading[t.id]} title="AI suggestion">
                              {aiLoading[t.id]?"...":"✦"}
                            </button>
                          </>
                        )}

                        {/* Breakdown toggle — only show if timekeepers exist */}
                        {hasTks && (
                          <button
                            style={{
                              ...s.btnSmall,
                              padding:"5px 8px", fontSize:10, whiteSpace:"nowrap",
                              color: hasBreakdown ? "#888" : ACCENT,
                              borderColor: hasBreakdown ? "#bbb" : ACCENT,
                              background: hasBreakdown ? "#f5f5f5" : "#fff",
                            }}
                            onClick={() => hasBreakdown ? disableBreakdown(p.id,t.id) : enableBreakdown(p.id,t.id)}
                            title={hasBreakdown ? "Remove hour breakdown" : "Add hour-based breakdown by timekeeper"}
                          >
                            {hasBreakdown ? "÷ off" : "÷ hrs"}
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Timekeeper breakdown panel */}
                    {hasBreakdown && (
                      <div style={s.bdTable}>
                        {timekeepers.length === 0 ? (
                          <div style={{fontSize:11,fontFamily:"sans-serif",color:MUTED,fontStyle:"italic"}}>
                            No timekeepers. Add team members in Step 1.
                          </div>
                        ) : (
                          <>
                            {/* Column headers */}
                            <div style={{display:"grid",gridTemplateColumns:"1fr 72px 72px 110px 24px",gap:8,marginBottom:6,paddingBottom:4,borderBottom:`1px solid ${BORDER}`}}>
                              <div style={s.bdColHdr}>Timekeeper</div>
                              <div style={{...s.bdColHdr,textAlign:"right"}}>Low hrs</div>
                              <div style={{...s.bdColHdr,textAlign:"right"}}>High hrs</div>
                              <div style={{...s.bdColHdr,textAlign:"right"}}>Amount</div>
                              <div></div>
                            </div>

                            {/* Timekeeper rows */}
                            {t.tkBreakdown.map(b => {
                              const tk = timekeepers.find(x=>x.id===b.tkId);
                              if (!tk) return null;
                              const bLo = (Number(b.hoursLow)||0) * (Number(tk.rate)||0);
                              const bHi = (Number(b.hoursHigh)||0) * (Number(tk.rate)||0);
                              return (
                                <div key={b.tkId} style={{display:"grid",gridTemplateColumns:"1fr 72px 72px 110px 24px",gap:8,alignItems:"center",marginBottom:6}}>
                                  <div>
                                    <div style={{fontSize:12,fontFamily:"sans-serif",color:TEXT,fontWeight:600}}>{tk.name||"—"}</div>
                                    <div style={{fontSize:10,fontFamily:"sans-serif",color:MUTED}}>{tk.title}{tk.rate ? ` · $${Number(tk.rate).toLocaleString()}/hr` : " · no rate"}</div>
                                  </div>
                                  <input
                                    style={s.hrsInput}
                                    placeholder="0"
                                    value={b.hoursLow}
                                    onChange={e=>updateTaskTk(p.id,t.id,b.tkId,"hoursLow",e.target.value.replace(/[^0-9.]/g,""))}
                                  />
                                  <input
                                    style={s.hrsInput}
                                    placeholder="0"
                                    value={b.hoursHigh}
                                    onChange={e=>updateTaskTk(p.id,t.id,b.tkId,"hoursHigh",e.target.value.replace(/[^0-9.]/g,""))}
                                  />
                                  <div style={{fontSize:11,fontFamily:"sans-serif",textAlign:"right",color:tk.rate?(bLo||bHi?ACCENT:MUTED):MUTED,fontWeight:bLo||bHi?600:400}}>
                                    {!tk.rate ? <span style={{fontStyle:"italic"}}>set rate</span> : (bLo||bHi ? `${fmt(bLo)} – ${fmt(bHi)}` : "—")}
                                  </div>
                                  <button onClick={()=>removeTkFromTask(p.id,t.id,b.tkId)} style={{background:"none",border:"none",cursor:"pointer",color:"#ccc",fontSize:14,padding:0,lineHeight:1,textAlign:"center"}} title="Remove from task">×</button>
                                </div>
                              );
                            })}

                            {/* Add timekeeper to task */}
                            {timekeepers.some(tk => !t.tkBreakdown.find(b=>b.tkId===tk.id)) && (
                              <div style={{marginTop:4}}>
                                <select
                                  style={{...s.select,fontSize:11,padding:"4px 8px"}}
                                  value=""
                                  onChange={e=>{if(e.target.value) addTkToTask(p.id,t.id,e.target.value); e.target.value="";}}
                                >
                                  <option value="">+ Add timekeeper to this task…</option>
                                  {timekeepers.filter(tk=>!t.tkBreakdown.find(b=>b.tkId===tk.id)).map(tk=>(
                                    <option key={tk.id} value={tk.id}>{tk.name||"Unnamed"} ({tk.title}{tk.rate?`, $${tk.rate}/hr`:""})</option>
                                  ))}
                                </select>
                              </div>
                            )}

                            {/* Task subtotal */}
                            {(cost.low > 0 || cost.high > 0) && (
                              <div style={{borderTop:`1px solid ${BORDER}`,marginTop:8,paddingTop:6,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                                <span style={{fontSize:10,fontFamily:"sans-serif",color:MUTED,textTransform:"uppercase",letterSpacing:"0.06em"}}>Task total</span>
                                <span style={{fontSize:13,fontFamily:"sans-serif",fontWeight:700,color:N}}>{fmt(cost.low)} — {fmt(cost.high)}</span>
                              </div>
                            )}

                            {!hasRates && (
                              <div style={{marginTop:6,fontSize:11,fontFamily:"sans-serif",color:"#a05c00",fontStyle:"italic"}}>
                                ⚠ Some timekeepers have no rate set — go to Step 1 to add rates.
                              </div>
                            )}
                          </>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ))}

          <div style={{display:"flex",alignItems:"center",gap:16,marginTop:16,paddingTop:16,borderTop:`1px solid ${BORDER}`}}>
            <div style={{flex:1,fontSize:13,fontFamily:"sans-serif",color:TEXT,fontWeight:600}}>Contingency</div>
            <input style={{...s.moneyInput,width:140}} value={contingency} onChange={e=>setContingency(e.target.value.replace(/[^0-9]/g,""))} />
            <div style={{width:hasTks ? 148 : 116}}></div>
          </div>
        </div>
        <div style={s.totalBar}>
          <span style={{fontSize:12,letterSpacing:"0.08em",textTransform:"uppercase"}}>Total Estimate</span>
          <span style={{fontSize:16}}>{fmt(totals().low)} — {fmt(totals().high)}</span>
        </div>
      </div>
    );
  };

  const Step4 = () => (
    <div style={s.card}>
      <div style={s.sectionTitle}>Fee Arrangement</div>
      <div style={s.radioRow}>
        {FEE_TYPES.map(f => (
          <label key={f.v} style={s.radioItem(feeType===f.v)} onClick={()=>setFeeType(f.v)}>
            <input type="radio" checked={feeType===f.v} onChange={()=>setFeeType(f.v)} style={{accentColor:ACCENT}} />
            <span style={s.radioLabel}>{f.l}</span>
          </label>
        ))}
      </div>

      {feeType==="hourly" && (
        <div style={{marginTop:20}}>
          <div style={s.sectionTitle}>
            Billing Rates
            {timekeepers.length > 0 && <span style={{fontSize:10,fontWeight:400,color:MUTED,textTransform:"none",letterSpacing:0,marginLeft:6}}>(from Step 1 — edit there)</span>}
          </div>

          {timekeepers.length > 0 ? (
            /* Show timekeepers from Step 1 */
            <div>
              <div style={{display:"grid",gridTemplateColumns:"2fr 1.4fr 1fr",gap:10,marginBottom:6,paddingBottom:6,borderBottom:`1px solid ${BORDER}`}}>
                <div style={s.bdColHdr}>Name</div>
                <div style={s.bdColHdr}>Title</div>
                <div style={{...s.bdColHdr,textAlign:"right"}}>Rate</div>
              </div>
              {timekeepers.map(tk => (
                <div key={tk.id} style={{display:"grid",gridTemplateColumns:"2fr 1.4fr 1fr",gap:10,padding:"7px 0",borderBottom:`1px solid #f0efeb`,alignItems:"center"}}>
                  <div style={{fontSize:13,fontFamily:"sans-serif",color:TEXT,fontWeight:600}}>{tk.name||<span style={{color:MUTED,fontStyle:"italic"}}>Unnamed</span>}</div>
                  <div style={{fontSize:13,fontFamily:"sans-serif",color:MUTED}}>{tk.title}</div>
                  <div style={{fontSize:13,fontFamily:"sans-serif",color:tk.rate?TEXT:MUTED,textAlign:"right"}}>{tk.rate ? `$${Number(tk.rate).toLocaleString()}/hr` : <span style={{fontStyle:"italic"}}>—</span>}</div>
                </div>
              ))}
              <div style={{marginTop:10,fontSize:12,fontFamily:"sans-serif",color:MUTED}}>
                To edit rates or add timekeepers, go back to Step 1.
              </div>
            </div>
          ) : (
            /* No timekeepers — generic rate reference fields */
            <div style={s.row2}>
              {["Partner","Senior Associate","Associate","Paralegal"].map(role => (
                <div key={role}>
                  <label style={s.label}>{role}</label>
                  <input style={s.input} placeholder="$/hr" type="text" />
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );

  const Step5 = () => (
    <div style={s.card}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
        <div style={s.sectionTitle}>Caveats and Exclusions</div>
        <button style={s.btnAI} onClick={generateCaveats} disabled={caveatsLoading}>
          {caveatsLoading ? "Generating..." : "✦ Generate Caveats"}
        </button>
      </div>
      <div style={{fontSize:12,fontFamily:"sans-serif",color:MUTED,marginBottom:20}}>
        Edit or remove any caveat. These appear at the bottom of all output documents.
        {" "}<span style={{color:"#5a8a5a"}}>AI generates caveats from matter type only — no client data is transmitted.</span>
      </div>
      {caveats.map((c,i) => (
        <div key={i} style={s.caveatRow}>
          <span style={{fontSize:12,fontFamily:"sans-serif",color:MUTED,paddingTop:10,minWidth:16}}>{i+1}.</span>
          <textarea style={s.caveatText} value={c} onChange={e=>{const a=[...caveats];a[i]=e.target.value;setCaveats(a);}} rows={2} />
          <button onClick={()=>setCaveats(caveats.filter((_,j)=>j!==i))} style={{background:"none",border:"none",cursor:"pointer",color:"#ccc",fontSize:18,paddingTop:8}}>×</button>
        </div>
      ))}
      <div style={{display:"flex",gap:8,marginTop:8}}>
        <input style={{...s.input,fontSize:13}} placeholder="Add caveat..." value={newCaveat} onChange={e=>setNewCaveat(e.target.value)} onKeyDown={e=>{if(e.key==="Enter"&&newCaveat.trim()){setCaveats([...caveats,newCaveat.trim()]);setNewCaveat("");}}} />
        <button style={s.btnSmall} onClick={()=>{if(newCaveat.trim()){setCaveats([...caveats,newCaveat.trim()]);setNewCaveat("")}}}>Add</button>
      </div>
    </div>
  );

  const Step6 = () => {
    const T = totals();
    return (
      <div>
        <div style={s.card}>
          <div style={s.sectionTitle}>Output Version</div>
          <div style={{display:"flex",gap:0,marginBottom:20}}>
            <button style={s.outputToggle(outputVersion==="client")} onClick={()=>setOutputVersion("client")}>Client-Facing</button>
            <button style={s.outputToggle(outputVersion==="internal")} onClick={()=>setOutputVersion("internal")}>Internal</button>
          </div>
          <div style={{fontSize:12,fontFamily:"sans-serif",color:MUTED,marginBottom:20}}>
            {outputVersion==="client" ? "Clean budget with totals and caveats. AI rationale and hour breakdowns suppressed." : "Full detail including AI rationale and per-timekeeper hour breakdowns."}
          </div>
        </div>

        <div style={s.card}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"baseline",marginBottom:16}}>
            <div style={s.sectionTitle}>Preview — {matter.client||matter.name||"Matter"}</div>
            <div style={{fontSize:11,fontFamily:"sans-serif",color:MUTED}}>{modeLabels[matter.type]}{matter.jurisdiction?` · ${matter.jurisdiction}`:""}</div>
          </div>

          {/* Timekeepers summary (internal only) */}
          {outputVersion==="internal" && timekeepers.length > 0 && (
            <div style={{marginBottom:20,paddingBottom:16,borderBottom:`1px solid ${BORDER}`}}>
              <div style={s.previewPhaseName}>Team</div>
              {timekeepers.map(tk => (
                <div key={tk.id} style={{...s.previewRow,fontSize:12}}>
                  <span style={{fontFamily:"sans-serif"}}>{tk.name||"—"} <span style={{color:MUTED}}>({tk.title})</span></span>
                  <span style={{fontFamily:"sans-serif",color:MUTED}}>{tk.rate ? `$${Number(tk.rate).toLocaleString()}/hr` : "—"}</span>
                </div>
              ))}
            </div>
          )}

          {phases.filter(p=>p.selected).map(p => {
            const tasks = p.tasks.filter(t=>t.selected);
            if (!tasks.length) return null;
            const pCost = tasks.reduce((a,t)=>{ const c=taskCost(t); return {low:a.low+c.low,high:a.high+c.high}; }, {low:0,high:0});
            return (
              <div key={p.id} style={s.previewPhase}>
                <div style={s.previewPhaseName}>{p.name}</div>
                {tasks.map(t => {
                  const c = taskCost(t);
                  return (
                    <div key={t.id}>
                      <div style={s.previewRow}>
                        <span>{t.name}{t.note&&<span style={{color:MUTED,fontStyle:"italic"}}> [{t.note}]</span>}</span>
                        <span style={{fontVariantNumeric:"tabular-nums"}}>{fmt(c.low)} — {fmt(c.high)}</span>
                      </div>
                      {/* Internal: show tk breakdown */}
                      {outputVersion==="internal" && t.tkBreakdown && t.tkBreakdown.map(b => {
                        const tk = timekeepers.find(x=>x.id===b.tkId);
                        if (!tk) return null;
                        const bLo = (Number(b.hoursLow)||0)*(Number(tk.rate)||0);
                        const bHi = (Number(b.hoursHigh)||0)*(Number(tk.rate)||0);
                        return (
                          <div key={b.tkId} style={{...s.previewRow,paddingLeft:20,color:MUTED,fontSize:11,borderBottom:"none"}}>
                            <span style={{fontFamily:"sans-serif",fontStyle:"italic"}}>{tk.name||tk.title} — {fmtHrs(b.hoursLow)}–{fmtHrs(b.hoursHigh)} @ ${tk.rate||0}/hr</span>
                            <span style={{fontVariantNumeric:"tabular-nums",fontStyle:"italic"}}>{fmt(bLo)} — {fmt(bHi)}</span>
                          </div>
                        );
                      })}
                      {outputVersion==="internal" && t.aiRationale && (
                        <div style={{fontSize:11,fontFamily:"sans-serif",color:"#5a8a5a",fontStyle:"italic",paddingLeft:20,paddingBottom:4}}>✦ {t.aiRationale}</div>
                      )}
                    </div>
                  );
                })}
                <div style={{...s.previewRow,fontWeight:600,color:MUTED,fontSize:11,paddingTop:6}}>
                  <span style={{letterSpacing:"0.04em",textTransform:"uppercase"}}>Subtotal</span>
                  <span>{fmt(pCost.low)} — {fmt(pCost.high)}</span>
                </div>
              </div>
            );
          })}

          <div style={{...s.previewRow,paddingTop:8,color:MUTED,fontStyle:"italic"}}>
            <span>Contingency</span>
            <span>{fmt(contingency)}</span>
          </div>
          <div style={s.previewTotal}>
            <span>Total Estimate</span>
            <span>{fmt(T.low)} — {fmt(T.high)}</span>
          </div>

          {caveats.length > 0 && (
            <div style={{marginTop:20,paddingTop:16,borderTop:`1px solid ${BORDER}`}}>
              <div style={{...s.sectionTitle,marginBottom:10}}>Caveats and Exclusions</div>
              {caveats.map((c,i) => <div key={i} style={{fontSize:11,fontFamily:"sans-serif",color:MUTED,marginBottom:5,lineHeight:1.5}}>{i+1}. {c}</div>)}
            </div>
          )}
        </div>

        <div style={s.card}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
            <div style={s.sectionTitle}>Budget Narrative</div>
            <button style={s.btnAI} onClick={generateSummary} disabled={summaryLoading}>
              {summaryLoading ? "Generating..." : "✦ Generate Summary"}
            </button>
          </div>
          <div style={{fontSize:12,fontFamily:"sans-serif",color:MUTED,marginBottom:12}}>
            A professional summary paragraph for cover emails or transmittal memos.
            {" "}<span style={{color:"#5a8a5a"}}>Only fee amounts and matter type are sent — no client or matter names.</span>
          </div>
          {summary ? (
            <>
              <textarea
                readOnly
                value={summary}
                style={{...s.caveatText,width:"100%",boxSizing:"border-box",minHeight:80,fontSize:13,color:TEXT,background:"#f7f6f3"}}
              />
              <button
                style={{...s.btnSmall,marginTop:8}}
                onClick={()=>{navigator.clipboard.writeText(summary);}}
              >
                Copy to clipboard
              </button>
            </>
          ) : (
            <div style={{fontSize:13,fontFamily:"sans-serif",color:MUTED,fontStyle:"italic"}}>
              Click "Generate Summary" to draft a budget narrative.
            </div>
          )}
        </div>

        {/* Monthly Spend Projection */}
        <div style={s.card}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:4}}>
            <div style={s.sectionTitle}>Monthly Spend Projection</div>
            <div style={{display:"flex",gap:6}}>
              <button
                onClick={()=>setTimelineMode("auto")}
                style={{...s.btnSmall, background: timelineMode==="auto" ? ACCENT : "#e8edf5", color: timelineMode==="auto" ? "#fff" : N, border:"none"}}
              >Auto</button>
              <button
                onClick={()=>setTimelineMode("manual")}
                style={{...s.btnSmall, background: timelineMode==="manual" ? ACCENT : "#e8edf5", color: timelineMode==="manual" ? "#fff" : N, border:"none"}}
              >Manual</button>
            </div>
          </div>
          <div style={{fontSize:12,fontFamily:"sans-serif",color:MUTED,marginBottom:16}}>
            {timelineMode==="auto"
              ? "Phases distributed across the matter duration weighted by budget. Switch to Manual to set exact timing."
              : "Set the start month and duration for each phase. Phases can overlap."}
          </div>

          {(() => {
            const totalMonths = parseDurationMonths(matter.duration);
            const activePhs = phases.filter(p => p.selected);

            const phaseTotal = (p) => {
              const tasks = p.tasks.filter(t => t.selected);
              const low  = tasks.reduce((s, t) => s + taskCost(t).low,  0);
              const high = tasks.reduce((s, t) => s + taskCost(t).high, 0);
              return { low, high, mid: (low + high) / 2 };
            };

            // Build timeline
            let timeline = {};
            if (timelineMode === "auto") {
              const totMid = activePhs.reduce((s,p) => s + phaseTotal(p).mid, 0);
              let cursor = 1;
              activePhs.forEach(p => {
                const weight = totMid > 0 ? phaseTotal(p).mid / totMid : 1/activePhs.length;
                const months = Math.max(1, Math.round(weight * totalMonths));
                timeline[p.id] = { start: cursor, months };
                cursor += months;
              });
            } else {
              activePhs.forEach(p => {
                timeline[p.id] = phaseTimeline[p.id] || { start: 1, months: Math.max(1, Math.floor(totalMonths / activePhs.length)) };
              });
            }

            // Monthly totals
            const monthlyData = Array.from({length: totalMonths}, (_, i) => {
              const month = i + 1;
              let low = 0, high = 0;
              activePhs.forEach(p => {
                const t = timeline[p.id] || { start: 1, months: 1 };
                if (month >= t.start && month < t.start + t.months) {
                  const pt = phaseTotal(p);
                  low += pt.low / t.months;
                  high += pt.high / t.months;
                }
              });
              return { month, low: Math.round(low), high: Math.round(high) };
            });

            const maxHigh = Math.max(...monthlyData.map(m => m.high), 1);

            const PHASE_COLORS = ["#2e5fa3","#0d7a6e","#6b3fa0","#b05a1a","#1a6b8a","#7a3a5a","#3a6b2a","#8a6b1a"];

            // Which phase dominates each month
            const monthPhase = monthlyData.map(({month}) => {
              let best = null, bestAmt = 0;
              activePhs.forEach((p, i) => {
                const t = timeline[p.id] || { start:1, months:1 };
                if (month >= t.start && month < t.start + t.months) {
                  const mid = phaseTotal(p).mid / t.months;
                  if (mid > bestAmt) { bestAmt = mid; best = i; }
                }
              });
              return best;
            });

            const fmtLocal = (n) => n >= 1000 ? `$${Math.round(n/1000)}k` : `$${n}`;

            return (
              <>
                {/* Manual phase timing editor */}
                {timelineMode === "manual" && (
                  <div style={{marginBottom:20}}>
                    <div style={{display:"grid",gridTemplateColumns:"2fr 1fr 1fr",gap:8,marginBottom:8,paddingBottom:6,borderBottom:`1px solid ${BORDER}`}}>
                      <div style={{fontSize:11,fontFamily:"sans-serif",fontWeight:700,color:MUTED,textTransform:"uppercase",letterSpacing:"0.05em"}}>Phase</div>
                      <div style={{fontSize:11,fontFamily:"sans-serif",fontWeight:700,color:MUTED,textTransform:"uppercase",letterSpacing:"0.05em"}}>Start Month</div>
                      <div style={{fontSize:11,fontFamily:"sans-serif",fontWeight:700,color:MUTED,textTransform:"uppercase",letterSpacing:"0.05em"}}>Duration (mo)</div>
                    </div>
                    {activePhs.map((p, i) => {
                      const t = timeline[p.id] || { start:1, months:1 };
                      return (
                        <div key={p.id} style={{display:"grid",gridTemplateColumns:"2fr 1fr 1fr",gap:8,marginBottom:8,alignItems:"center"}}>
                          <div style={{fontSize:13,fontFamily:"sans-serif",color:N,display:"flex",alignItems:"center",gap:6}}>
                            <span style={{width:10,height:10,borderRadius:2,background:PHASE_COLORS[i%PHASE_COLORS.length],display:"inline-block",flexShrink:0}}></span>
                            {p.name}
                          </div>
                          <input
                            type="number" min="1" max={totalMonths}
                            value={t.start}
                            onChange={e => setPhaseTimeline(prev => ({...prev, [p.id]: {...(prev[p.id]||t), start: Math.max(1,parseInt(e.target.value)||1)}}))}
                            style={{...s.input, padding:"4px 8px", fontSize:13, textAlign:"center"}}
                          />
                          <input
                            type="number" min="1" max={totalMonths}
                            value={t.months}
                            onChange={e => setPhaseTimeline(prev => ({...prev, [p.id]: {...(prev[p.id]||t), months: Math.max(1,parseInt(e.target.value)||1)}}))}
                            style={{...s.input, padding:"4px 8px", fontSize:13, textAlign:"center"}}
                          />
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Bar chart */}
                <div style={{overflowX:"auto"}}>
                  <div style={{display:"flex", alignItems:"flex-end", gap:3, height:140, minWidth: totalMonths * 28, paddingBottom:0}}>
                    {monthlyData.map(({month, low, high}, i) => {
                      const color = monthPhase[i] !== null ? PHASE_COLORS[monthPhase[i] % PHASE_COLORS.length] : "#ccc";
                      const highPct = maxHigh > 0 ? (high / maxHigh) * 100 : 0;
                      const lowPct = high > 0 ? (low / high) * 100 : 0;
                      return (
                        <div key={month} style={{display:"flex",flexDirection:"column",alignItems:"center",flex:"0 0 auto",width:24}}>
                          <div style={{width:"100%",height:120,display:"flex",flexDirection:"column",justifyContent:"flex-end",position:"relative"}}>
                            <div style={{width:"100%",height:`${highPct}%`,background:color,opacity:0.35,borderRadius:"2px 2px 0 0",position:"absolute",bottom:0}} />
                            <div style={{width:"100%",height:`${highPct * lowPct / 100}%`,background:color,borderRadius:"2px 2px 0 0",position:"absolute",bottom:0}} />
                          </div>
                          <div style={{fontSize:9,fontFamily:"sans-serif",color:MUTED,marginTop:3,textAlign:"center"}}>{month}</div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* X-axis label */}
                <div style={{fontSize:11,fontFamily:"sans-serif",color:MUTED,textAlign:"center",marginTop:4}}>Month</div>

                {/* Phase legend */}
                <div style={{display:"flex",flexWrap:"wrap",gap:"6px 16px",marginTop:14}}>
                  {activePhs.map((p, i) => (
                    <div key={p.id} style={{display:"flex",alignItems:"center",gap:5,fontSize:11,fontFamily:"sans-serif",color:N}}>
                      <span style={{width:10,height:10,borderRadius:2,background:PHASE_COLORS[i%PHASE_COLORS.length],display:"inline-block"}}></span>
                      {p.name}
                    </div>
                  ))}
                </div>

                {/* Monthly table summary */}
                <details style={{marginTop:16}}>
                  <summary style={{fontSize:12,fontFamily:"sans-serif",color:ACCENT,cursor:"pointer",userSelect:"none"}}>View monthly breakdown table</summary>
                  <div style={{overflowX:"auto",marginTop:10}}>
                    <table style={{width:"100%",borderCollapse:"collapse",fontSize:12,fontFamily:"sans-serif"}}>
                      <thead>
                        <tr style={{borderBottom:`2px solid ${BORDER}`}}>
                          <th style={{textAlign:"left",padding:"4px 8px",color:MUTED,fontWeight:700}}>Month</th>
                          <th style={{textAlign:"right",padding:"4px 8px",color:MUTED,fontWeight:700}}>Low</th>
                          <th style={{textAlign:"right",padding:"4px 8px",color:MUTED,fontWeight:700}}>High</th>
                          <th style={{textAlign:"right",padding:"4px 8px",color:MUTED,fontWeight:700}}>Cumulative (mid)</th>
                        </tr>
                      </thead>
                      <tbody>
                        {monthlyData.reduce((acc, {month, low, high}) => {
                          const prev = acc.length > 0 ? acc[acc.length-1].cumMid : 0;
                          const mid = Math.round((low+high)/2);
                          acc.push({month, low, high, cumMid: prev + mid});
                          return acc;
                        }, []).map(({month, low, high, cumMid}, i) => (
                          <tr key={month} style={{background: i%2===0?"#f9fafc":"#fff", borderBottom:`1px solid ${BORDER}`}}>
                            <td style={{padding:"4px 8px",color:N}}>{month}</td>
                            <td style={{padding:"4px 8px",textAlign:"right",color:N}}>{fmtLocal(low)}</td>
                            <td style={{padding:"4px 8px",textAlign:"right",color:N}}>{fmtLocal(high)}</td>
                            <td style={{padding:"4px 8px",textAlign:"right",color:MUTED}}>{fmtLocal(cumMid)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </details>
              </>
            );
          })()}
        </div>

        <div style={{display:"flex",gap:12}}>
          <button style={{...s.btn(true),flex:1}} onClick={exportExcel} disabled={!xlsxReady}>
            {xlsxReady ? "↓ Download Excel" : "Loading..."}
          </button>
          <button style={{...s.btn(false),flex:1,opacity:0.5,cursor:"not-allowed"}} disabled title="Coming in next version">
            ↓ Download Word / PDF
          </button>
        </div>
      </div>
    );
  };

  const stepComponents = [null, Step1, Step2, Step3, Step4, Step5, Step6];

  if (!mode) return <LandingPage onSelect={setMode} />;
  if (!acknowledged) return <DisclaimerPage onAccept={()=>setAcknowledged(true)} onBack={()=>setMode(null)} />;

  return (
    <div style={s.wrap}>
      <div style={s.header}>
        <div>
          <div style={s.headerTitle}>
            {mode === "corporate" ? "Corporate Budget Builder" : mode === "tax" ? "Tax Budget Builder" : "Litigation Budget Builder"}
          </div>
          <div style={s.headerSub}>{matter.client || matter.name || (mode === "corporate" ? "New deal" : mode === "tax" ? "New matter" : "New matter")}</div>
        </div>
        <div style={{display:"flex",alignItems:"center",gap:20}}>
          <div style={{fontSize:12,fontFamily:"sans-serif",color:"#8a9cbf"}}>
            {matter.type ? modeLabels[matter.type] : ""}
          </div>
          <button
            onClick={()=>{ setMode(null); setAcknowledged(false); }}
            style={{fontSize:11,fontFamily:"sans-serif",color:"#fff",background:ACCENT,border:"none",borderRadius:3,padding:"6px 14px",cursor:"pointer",letterSpacing:"0.05em",fontWeight:600}}
          >
            ← Change type
          </button>
        </div>
      </div>

      <div style={s.steps}>
        {STEPS.map((label,i) => {
          const n = i+1;
          return (
            <div key={n} style={s.stepItem(step===n, step>n)} onClick={()=>setStep(n)}>
              {n}. {label}
            </div>
          );
        })}
      </div>

      <div style={s.body}>
        {stepComponents[step] && stepComponents[step]()}
      </div>

      <div style={s.nav}>
        <button style={s.btn(false)} onClick={()=>setStep(st=>Math.max(1,st-1))} disabled={step===1}>
          ← Back
        </button>
        <span style={{fontSize:11,fontFamily:"sans-serif",color:MUTED,letterSpacing:"0.06em"}}>
          Step {step} of {STEPS.length}
        </span>
        {step < STEPS.length
          ? <button style={s.btn(true)} onClick={()=>setStep(st=>Math.min(STEPS.length,st+1))}>Next →</button>
          : <div style={{width:80}}></div>
        }
      </div>
    </div>
  );
}
