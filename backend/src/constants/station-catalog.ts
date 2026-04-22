// Auto-generated catalog corresponding to CPCB stations.
export interface StationEntry {
  name: string;
  id: string;
}

export interface CityEntry {
  city: string;
  stations: StationEntry[];
}

export interface StateEntry {
  state: string;
  cities: CityEntry[];
}

export const STATION_CATALOG: StateEntry[] = [
  {
    state: 'Andaman and Nicobar',
    cities: [
      {
        city: 'Sri Vijaya Puram',
        stations: [
          { name: 'Police Line, Sri Vijaya Puram - ANPCC', id: 'police-line-sri-vijaya-puram-anpcc' },
        ]
      },
    ]
  },
  {
    state: 'Andhra Pradesh',
    cities: [
      {
        city: 'Amaravati',
        stations: [
          { name: 'Secretariat, Amaravati - APPCB', id: 'secretariat-amaravati-appcb' },
        ]
      },
      {
        city: 'Anantapur',
        stations: [
          { name: 'Gulzarpet, Anantapur - APPCB', id: 'gulzarpet-anantapur-appcb' },
        ]
      },
      {
        city: 'Chittoor',
        stations: [
          { name: 'Gangineni Cheruvu, Chittoor - APPCB', id: 'gangineni-cheruvu-chittoor-appcb' },
        ]
      },
      {
        city: 'Eluru',
        stations: [
          { name: 'District Court, Eluru - APPCB', id: 'district-court-eluru-appcb' },
        ]
      },
      {
        city: 'Guntur',
        stations: [
          { name: 'Rajendra Nagar North, Guntur - APPCB', id: 'rajendra-nagar-north-guntur-appcb' },
        ]
      },
      {
        city: 'Kadapa',
        stations: [
          { name: 'Yerramukkapalli, Kadapa - APPCB', id: 'yerramukkapalli-kadapa-appcb' },
        ]
      },
      {
        city: 'Machilipatnam',
        stations: [
          { name: 'Srinivas Nagar Colony, Machilipatnam - APPCB', id: 'srinivas-nagar-colony-machilipatnam-appcb' },
        ]
      },
      {
        city: 'Nellore',
        stations: [
          { name: 'Ambedkar Nagar, Nellore - APPCB', id: 'ambedkar-nagar-nellore-appcb' },
        ]
      },
      {
        city: 'Rajamahendravaram',
        stations: [
          { name: 'Anand Kala Kshetram, Rajamahendravaram - APPCB', id: 'anand-kala-kshetram-rajamahendravaram-appcb' },
        ]
      },
      {
        city: 'Tirumala',
        stations: [
          { name: 'Toll Gate, Tirumala - APPCB', id: 'toll-gate-tirumala-appcb' },
        ]
      },
      {
        city: 'Tirupati',
        stations: [
          { name: 'Vaikuntapuram, Tirupati - APPCB', id: 'vaikuntapuram-tirupati-appcb' },
        ]
      },
      {
        city: 'Vijayawada',
        stations: [
          { name: 'HB Colony, Vijayawada - APPCB', id: 'hb-colony-vijayawada-appcb' },
          { name: 'Kanuru, Vijayawada - APPCB', id: 'kanuru-vijayawada-appcb' },
          { name: 'Rajiv Gandhi Park, Vijayawada - APPCB', id: 'rajiv-gandhi-park-vijayawada-appcb' },
          { name: 'Rajiv Nagar, Vijayawada - APPCB', id: 'rajiv-nagar-vijayawada-appcb' },
        ]
      },
      {
        city: 'Visakhapatnam',
        stations: [
          { name: 'GVM Corporation, Visakhapatnam - APPCB', id: 'gvm-corporation-visakhapatnam-appcb' },
        ]
      },
    ]
  },
  {
    state: 'Arunachal Pradesh',
    cities: [
      {
        city: 'Naharlagun',
        stations: [
          { name: 'Naharlagun, Naharlagun - APSPCB', id: 'naharlagun-naharlagun-apspcb' },
        ]
      },
    ]
  },
  {
    state: 'Assam',
    cities: [
      {
        city: 'Byrnihat',
        stations: [
          { name: 'Central Academy for SFS, Byrnihat - PCBA', id: 'central-academy-for-sfs-byrnihat-pcba' },
        ]
      },
      {
        city: 'Guwahati',
        stations: [
          { name: 'IITG, Guwahati - PCBA', id: 'iitg-guwahati-pcba' },
          { name: 'LGBI Airport, Guwahati - PCBA', id: 'lgbi-airport-guwahati-pcba' },
          { name: 'Pan Bazaar, Guwahati - PCBA', id: 'pan-bazaar-guwahati-pcba' },
          { name: 'Railway Colony, Guwahati - PCBA', id: 'railway-colony-guwahati-pcba' },
        ]
      },
      {
        city: 'Nagaon',
        stations: [
          { name: 'Christianpatty, Nagaon - PCBA', id: 'christianpatty-nagaon-pcba' },
        ]
      },
      {
        city: 'Nalbari',
        stations: [
          { name: 'Bata Chowk, Nalbari - PCBA', id: 'bata-chowk-nalbari-pcba' },
        ]
      },
      {
        city: 'Silchar',
        stations: [
          { name: 'Tarapur, Silchar - PCBA', id: 'tarapur-silchar-pcba' },
        ]
      },
      {
        city: 'Sivasagar',
        stations: [
          { name: 'Girls College, Sivasagar - PCBA', id: 'girls-college-sivasagar-pcba' },
        ]
      },
    ]
  },
  {
    state: 'Bihar',
    cities: [
      {
        city: 'Araria',
        stations: [
          { name: 'Kharahiya Basti, Araria - BSPCB', id: 'kharahiya-basti-araria-bspcb' },
        ]
      },
      {
        city: 'Arrah',
        stations: [
          { name: 'New DM Office, Arrah - BSPCB', id: 'new-dm-office-arrah-bspcb' },
        ]
      },
      {
        city: 'Aurangabad',
        stations: [
          { name: 'Gurdeo Nagar, Aurangabad - BSPCB', id: 'gurdeo-nagar-aurangabad-bspcb' },
        ]
      },
      {
        city: 'Begusarai',
        stations: [
          { name: 'Lohiyanagar, Begusarai - BSPCB', id: 'lohiyanagar-begusarai-bspcb' },
        ]
      },
      {
        city: 'Bettiah',
        stations: [
          { name: 'Kamalnath Nagar, Bettiah - BSPCB', id: 'kamalnath-nagar-bettiah-bspcb' },
        ]
      },
      {
        city: 'Bhagalpur',
        stations: [
          { name: 'DM Office_Kachari Chowk, Bhagalpur - BSPCB', id: 'dm-office-kachari-chowk-bhagalpur-bspcb' },
          { name: 'Mayaganj, Bhagalpur - BSPCB', id: 'mayaganj-bhagalpur-bspcb' },
        ]
      },
      {
        city: 'Bihar Sharif',
        stations: [
          { name: 'D M Colony, Bihar Sharif - BSPCB', id: 'd-m-colony-bihar-sharif-bspcb' },
        ]
      },
      {
        city: 'Buxar',
        stations: [
          { name: 'Charitra Van, Buxar - BSPCB', id: 'charitra-van-buxar-bspcb' },
        ]
      },
      {
        city: 'Chhapra',
        stations: [
          { name: 'Darshan Nagar, Chhapra - BSPCB', id: 'darshan-nagar-chhapra-bspcb' },
        ]
      },
      {
        city: 'Darbhanga',
        stations: [
          { name: 'Town Hall - Lal Bagh, Darbhanga - BSPCB', id: 'town-hall-lal-bagh-darbhanga-bspcb' },
        ]
      },
      {
        city: 'Gaya',
        stations: [
          { name: 'Collectorate, Gaya - BSPCB', id: 'collectorate-gaya-bspcb' },
          { name: 'Kareemganj, Gaya - BSPCB', id: 'kareemganj-gaya-bspcb' },
          { name: 'SFTI Kusdihra, Gaya - BSPCB', id: 'sfti-kusdihra-gaya-bspcb' },
        ]
      },
      {
        city: 'Hajipur',
        stations: [
          { name: 'Industrial Area, Hajipur - BSPCB', id: 'industrial-area-hajipur-bspcb' },
        ]
      },
      {
        city: 'Katihar',
        stations: [
          { name: 'Mirchaibari, Katihar - BSPCB', id: 'mirchaibari-katihar-bspcb' },
        ]
      },
      {
        city: 'Kishanganj',
        stations: [
          { name: 'SDM Office_Khagra, Kishanganj - BSPCB', id: 'sdm-office-khagra-kishanganj-bspcb' },
        ]
      },
      {
        city: 'Manguraha',
        stations: [
          { name: 'Forest Rest House, Manguraha - BSPCB', id: 'forest-rest-house-manguraha-bspcb' },
        ]
      },
      {
        city: 'Motihari',
        stations: [
          { name: 'Gandak Colony, Motihari - BSPCB', id: 'gandak-colony-motihari-bspcb' },
        ]
      },
      {
        city: 'Munger',
        stations: [
          { name: 'Town Hall, Munger - BSPCB', id: 'town-hall-munger-bspcb' },
        ]
      },
      {
        city: 'Muzaffarpur',
        stations: [
          { name: 'Buddha Colony, Muzaffarpur - BSPCB', id: 'buddha-colony-muzaffarpur-bspcb' },
          { name: 'MIT-Daudpur Kothi, Muzaffarpur - BSPCB', id: 'mit-daudpur-kothi-muzaffarpur-bspcb' },
          { name: 'Muzaffarpur Collectorate, Muzaffarpur - BSPCB', id: 'muzaffarpur-collectorate-muzaffarpur-bspcb' },
        ]
      },
      {
        city: 'Patna',
        stations: [
          { name: 'DRM Office Danapur, Patna - BSPCB', id: 'drm-office-danapur-patna-bspcb' },
          { name: 'Govt. High School Shikarpur, Patna - BSPCB', id: 'govt-high-school-shikarpur-patna-bspcb' },
          { name: 'IGSC Planetarium Complex, Patna - BSPCB', id: 'igsc-planetarium-complex-patna-bspcb' },
          { name: 'Muradpur, Patna - BSPCB', id: 'muradpur-patna-bspcb' },
          { name: 'Rajbansi Nagar, Patna - BSPCB', id: 'rajbansi-nagar-patna-bspcb' },
          { name: 'Samanpura, Patna - BSPCB', id: 'samanpura-patna-bspcb' },
        ]
      },
      {
        city: 'Purnia',
        stations: [
          { name: 'Mariam Nagar, Purnia - BSPCB', id: 'mariam-nagar-purnia-bspcb' },
        ]
      },
      {
        city: 'Rajgir',
        stations: [
          { name: 'Dangi Tola, Rajgir - BSPCB', id: 'dangi-tola-rajgir-bspcb' },
        ]
      },
      {
        city: 'Saharsa',
        stations: [
          { name: 'Police Line, Saharsa - BSPCB', id: 'police-line-saharsa-bspcb' },
        ]
      },
      {
        city: 'Samastipur',
        stations: [
          { name: 'DM Office_Kasipur, Samastipur - BSPCB', id: 'dm-office-kasipur-samastipur-bspcb' },
        ]
      },
      {
        city: 'Sasaram',
        stations: [
          { name: 'Dada Peer, Sasaram - BSPCB', id: 'dada-peer-sasaram-bspcb' },
        ]
      },
      {
        city: 'Siwan',
        stations: [
          { name: 'Chitragupta Nagar, Siwan - BSPCB', id: 'chitragupta-nagar-siwan-bspcb' },
        ]
      },
    ]
  },
  {
    state: 'Chandigarh',
    cities: [
      {
        city: 'Chandigarh',
        stations: [
          { name: 'Sector 22, Chandigarh - CPCC', id: 'sector-22-chandigarh-cpcc' },
          { name: 'Sector-25, Chandigarh - CPCC', id: 'sector-25-chandigarh-cpcc' },
          { name: 'Sector-53, Chandigarh - CPCC', id: 'sector-53-chandigarh-cpcc' },
        ]
      },
    ]
  },
  {
    state: 'Chhattisgarh',
    cities: [
      {
        city: 'Bhilai',
        stations: [
          { name: '32Bungalows, Bhilai - CECB', id: '32bungalows-bhilai-cecb' },
          { name: 'Civic Center, Bhilai - Bhilai Steel Plant', id: 'civic-center-bhilai-bhilai-steel-plant' },
          { name: 'Hathkhoj, Bhilai - CECB', id: 'hathkhoj-bhilai-cecb' },
        ]
      },
      {
        city: 'Bilaspur',
        stations: [
          { name: 'Mangala, Bilaspur - NTPC', id: 'mangala-bilaspur-ntpc' },
        ]
      },
      {
        city: 'Chhal',
        stations: [
          { name: 'Nawapara SECL Colony, Chhal - CECB', id: 'nawapara-secl-colony-chhal-cecb' },
        ]
      },
      {
        city: 'Korba',
        stations: [
          { name: 'Rampur, Korba - CECB', id: 'rampur-korba-cecb' },
          { name: 'Urja Nagar, Korba - CECB', id: 'urja-nagar-korba-cecb' },
        ]
      },
      {
        city: 'Kunjemura',
        stations: [
          { name: 'OP Jindal School, Kunjemura - CECB', id: 'op-jindal-school-kunjemura-cecb' },
        ]
      },
      {
        city: 'Milupara',
        stations: [
          { name: 'Govt. Higher Secondary School, Milupara - CECB', id: 'govt-higher-secondary-school-milupara-cecb' },
        ]
      },
      {
        city: 'Raipur',
        stations: [
          { name: 'AIIMS, Raipur - CECB', id: 'aiims-raipur-cecb' },
          { name: 'Bhatagaon New ISBT, Raipur - CECB', id: 'bhatagaon-new-isbt-raipur-cecb' },
          { name: 'Krishak Nagar, Raipur - CECB', id: 'krishak-nagar-raipur-cecb' },
          { name: 'Siltara Phase-II, Raipur - CECB', id: 'siltara-phase-ii-raipur-cecb' },
        ]
      },
      {
        city: 'Tumidih',
        stations: [
          { name: 'OP Jindal Industrial Park, Tumidih - CECB', id: 'op-jindal-industrial-park-tumidih-cecb' },
        ]
      },
    ]
  },
  {
    state: 'Delhi',
    cities: [
      {
        city: 'Delhi',
        stations: [
          { name: 'Alipur, Delhi - DPCC', id: 'alipur-delhi-dpcc' },
          { name: 'Anand Vihar, Delhi - DPCC', id: 'anand-vihar-delhi-dpcc' },
          { name: 'Ashok Vihar, Delhi - DPCC', id: 'ashok-vihar-delhi-dpcc' },
          { name: 'Aya Nagar, Delhi - IMD', id: 'aya-nagar-delhi-imd' },
          { name: 'Bawana, Delhi - DPCC', id: 'bawana-delhi-dpcc' },
          { name: 'Burari Crossing, Delhi - IMD', id: 'burari-crossing-delhi-imd' },
          { name: 'CRRI Mathura Road, Delhi - IMD', id: 'crri-mathura-road-delhi-imd' },
          { name: 'Cantonment Area, Delhi - DPCC', id: 'cantonment-area-delhi-dpcc' },
          { name: 'Chandni Chowk, Delhi - IITM', id: 'chandni-chowk-delhi-iitm' },
          { name: 'Commonwealth Sports Complex, Delhi - DPCC', id: 'commonwealth-sports-complex-delhi-dpcc' },
          { name: 'DTU, Delhi - CPCB', id: 'dtu-delhi-cpcb' },
          { name: 'Dr. Karni Singh Shooting Range, Delhi - DPCC', id: 'dr-karni-singh-shooting-range-delhi-dpcc' },
          { name: 'Dwarka-Sector 8, Delhi - DPCC', id: 'dwarka-sector-8-delhi-dpcc' },
          { name: 'IGI Airport (T3), Delhi - IMD', id: 'igi-airport-t3-delhi-imd' },
          { name: 'IGNOU_Maidan Garhi, Delhi - DPCC', id: 'ignou-maidan-garhi-delhi-dpcc' },
          { name: 'IHBAS, Dilshad Garden, Delhi - CPCB', id: 'ihbas-dilshad-garden-delhi-cpcb' },
          { name: 'IIT Delhi, Delhi - IITM', id: 'iit-delhi-delhi-iitm' },
          { name: 'ITO, Delhi - CPCB', id: 'ito-delhi-cpcb' },
          { name: 'JNU, Delhi - DPCC', id: 'jnu-delhi-dpcc' },
          { name: 'Jahangirpuri, Delhi - DPCC', id: 'jahangirpuri-delhi-dpcc' },
          { name: 'Jawaharlal Nehru Stadium, Delhi - DPCC', id: 'jawaharlal-nehru-stadium-delhi-dpcc' },
          { name: 'Lodhi Road, Delhi - IITM', id: 'lodhi-road-delhi-iitm' },
          { name: 'Lodhi Road, Delhi - IMD', id: 'lodhi-road-delhi-imd' },
          { name: 'Major Dhyan Chand National Stadium, Delhi - DPCC', id: 'major-dhyan-chand-national-stadium-delhi-dpcc' },
          { name: 'Mandir Marg, Delhi - DPCC', id: 'mandir-marg-delhi-dpcc' },
          { name: 'Mundka, Delhi - DPCC', id: 'mundka-delhi-dpcc' },
          { name: 'NSIT Dwarka, Delhi - CPCB', id: 'nsit-dwarka-delhi-cpcb' },
          { name: 'NSUT Jaffarpur, Delhi - DPCC', id: 'nsut-jaffarpur-delhi-dpcc' },
          { name: 'Najafgarh, Delhi - DPCC', id: 'najafgarh-delhi-dpcc' },
          { name: 'Narela, Delhi - DPCC', id: 'narela-delhi-dpcc' },
          { name: 'Nehru Nagar, Delhi - DPCC', id: 'nehru-nagar-delhi-dpcc' },
          { name: 'New Moti Bagh, Delhi - MHUA', id: 'new-moti-bagh-delhi-mhua' },
          { name: 'North Campus, DU, Delhi - IMD', id: 'north-campus-du-delhi-imd' },
          { name: 'Okhla Phase-2, Delhi - DPCC', id: 'okhla-phase-2-delhi-dpcc' },
          { name: 'Patparganj, Delhi - DPCC', id: 'patparganj-delhi-dpcc' },
          { name: 'Punjabi Bagh, Delhi - DPCC', id: 'punjabi-bagh-delhi-dpcc' },
          { name: 'Pusa, Delhi - DPCC', id: 'pusa-delhi-dpcc' },
          { name: 'Pusa, Delhi - IMD', id: 'pusa-delhi-imd' },
          { name: 'R K Puram, Delhi - DPCC', id: 'r-k-puram-delhi-dpcc' },
          { name: 'Rohini, Delhi - DPCC', id: 'rohini-delhi-dpcc' },
          { name: 'Shadipur, Delhi - CPCB', id: 'shadipur-delhi-cpcb' },
          { name: 'Sirifort, Delhi - CPCB', id: 'sirifort-delhi-cpcb' },
          { name: 'Sonia Vihar, Delhi - DPCC', id: 'sonia-vihar-delhi-dpcc' },
          { name: 'Sri Aurobindo Marg, Delhi - DPCC', id: 'sri-aurobindo-marg-delhi-dpcc' },
          { name: 'Talkatora Garden, Delhi - DPCC', id: 'talkatora-garden-delhi-dpcc' },
          { name: 'Vivek Vihar, Delhi - DPCC', id: 'vivek-vihar-delhi-dpcc' },
          { name: 'Wazirpur, Delhi - DPCC', id: 'wazirpur-delhi-dpcc' },
        ]
      },
    ]
  },
  {
    state: 'Gujarat',
    cities: [
      {
        city: 'Ahmedabad',
        stations: [
          { name: 'Chandkheda, Ahmedabad - IITM', id: 'chandkheda-ahmedabad-iitm' },
          { name: 'Gyaspur, Ahmedabad - IITM', id: 'gyaspur-ahmedabad-iitm' },
          { name: 'Maninagar, Ahmedabad - GPCB', id: 'maninagar-ahmedabad-gpcb' },
          { name: 'Raikhad, Ahmedabad - IITM', id: 'raikhad-ahmedabad-iitm' },
          { name: 'Rakhial, Ahmedabad - IITM', id: 'rakhial-ahmedabad-iitm' },
          { name: 'SAC ISRO Bopal, Ahmedabad - IITM', id: 'sac-isro-bopal-ahmedabad-iitm' },
          { name: 'SAC ISRO Satellite, Ahmedabad - IITM', id: 'sac-isro-satellite-ahmedabad-iitm' },
          { name: 'SVPI Airport Hansol, Ahmedabad - IITM', id: 'svpi-airport-hansol-ahmedabad-iitm' },
          { name: 'Sardar Vallabhbhai Patel Stadium, Ahmedabad - IITM', id: 'sardar-vallabhbhai-patel-stadium-ahmedabad-iitm' },
        ]
      },
      {
        city: 'Ankleshwar',
        stations: [
          { name: 'GIDC, Ankleshwar - GPCB', id: 'gidc-ankleshwar-gpcb' },
        ]
      },
      {
        city: 'Bhavnagar',
        stations: [
          { name: 'Vidhyanagar, Bhavnagar - Nexteng Enviro', id: 'vidhyanagar-bhavnagar-nexteng-enviro' },
        ]
      },
      {
        city: 'Gandhinagar',
        stations: [
          { name: 'GIFT City, Gandhinagar - IITM', id: 'gift-city-gandhinagar-iitm' },
          { name: 'IIPHG Lekawada, Gandhinagar - IITM', id: 'iiphg-lekawada-gandhinagar-iitm' },
          { name: 'Sector-10, Gandhinagar - GPCB', id: 'sector-10-gandhinagar-gpcb' },
        ]
      },
      {
        city: 'Mehsana',
        stations: [
          { name: 'Sadanand Nagar, Mehsana - Nexteng Enviro', id: 'sadanand-nagar-mehsana-nexteng-enviro' },
        ]
      },
      {
        city: 'Nandesari',
        stations: [
          { name: 'GIDC, Nandesari - Nandesari Ind. Association', id: 'gidc-nandesari-nandesari-ind-association' },
        ]
      },
      {
        city: 'Rajkot',
        stations: [
          { name: 'Mavdi, Rajkot - Nexteng Enviro', id: 'mavdi-rajkot-nexteng-enviro' },
        ]
      },
      {
        city: 'Surat',
        stations: [
          { name: 'Katargam, Surat - Nexteng Enviro', id: 'katargam-surat-nexteng-enviro' },
          { name: 'Science Center, Surat - SMC', id: 'science-center-surat-smc' },
        ]
      },
      {
        city: 'Vadodara',
        stations: [
          { name: 'Bapunagar, Vadodara - Nexteng Enviro', id: 'bapunagar-vadodara-nexteng-enviro' },
        ]
      },
      {
        city: 'Vapi',
        stations: [
          { name: 'Phase-1 GIDC, Vapi - GPCB', id: 'phase-1-gidc-vapi-gpcb' },
        ]
      },
      {
        city: 'Vatva',
        stations: [
          { name: 'Phase-4 GIDC, Vatva - GPCB', id: 'phase-4-gidc-vatva-gpcb' },
        ]
      },
    ]
  },
  {
    state: 'Haryana',
    cities: [
      {
        city: 'Ambala',
        stations: [
          { name: 'Patti Mehar, Ambala - HSPCB', id: 'patti-mehar-ambala-hspcb' },
        ]
      },
      {
        city: 'Bahadurgarh',
        stations: [
          { name: 'Arya Nagar, Bahadurgarh - HSPCB', id: 'arya-nagar-bahadurgarh-hspcb' },
        ]
      },
      {
        city: 'Ballabgarh',
        stations: [
          { name: 'Nathu Colony, Ballabgarh - HSPCB', id: 'nathu-colony-ballabgarh-hspcb' },
        ]
      },
      {
        city: 'Bhiwani',
        stations: [
          { name: 'H.B. Colony, Bhiwani - HSPCB', id: 'h-b-colony-bhiwani-hspcb' },
        ]
      },
      {
        city: 'Charkhi Dadri',
        stations: [
          { name: 'Mini Secretariat, Charkhi Dadri - HSPCB', id: 'mini-secretariat-charkhi-dadri-hspcb' },
        ]
      },
      {
        city: 'Dharuhera',
        stations: [
          { name: 'Municipal Corporation Office, Dharuhera -  HSPCB', id: 'municipal-corporation-office-dharuhera-hspcb' },
        ]
      },
      {
        city: 'Faridabad',
        stations: [
          { name: 'New Industrial Town, Faridabad - HSPCB', id: 'new-industrial-town-faridabad-hspcb' },
          { name: 'Sector 11, Faridabad - HSPCB', id: 'sector-11-faridabad-hspcb' },
          { name: 'Sector 30, Faridabad - HSPCB', id: 'sector-30-faridabad-hspcb' },
          { name: 'Sector- 16A, Faridabad - HSPCB', id: 'sector-16a-faridabad-hspcb' },
        ]
      },
      {
        city: 'Fatehabad',
        stations: [
          { name: 'Huda Sector, Fatehabad - HSPCB', id: 'huda-sector-fatehabad-hspcb' },
        ]
      },
      {
        city: 'Gurugram',
        stations: [
          { name: 'NISE Gwal Pahari, Gurugram - IMD', id: 'nise-gwal-pahari-gurugram-imd' },
          { name: 'Sector-51, Gurugram - HSPCB', id: 'sector-51-gurugram-hspcb' },
          { name: 'Teri Gram, Gurugram - HSPCB', id: 'teri-gram-gurugram-hspcb' },
          { name: 'Vikas Sadan, Gurugram - HSPCB', id: 'vikas-sadan-gurugram-hspcb' },
        ]
      },
      {
        city: 'Hisar',
        stations: [
          { name: 'Urban Estate-II, Hisar - HSPCB', id: 'urban-estate-ii-hisar-hspcb' },
        ]
      },
      {
        city: 'Jind',
        stations: [
          { name: 'Police Lines, Jind - HSPCB', id: 'police-lines-jind-hspcb' },
        ]
      },
      {
        city: 'Kaithal',
        stations: [
          { name: 'Rishi Nagar, Kaithal - HSPCB', id: 'rishi-nagar-kaithal-hspcb' },
        ]
      },
      {
        city: 'Karnal',
        stations: [
          { name: 'Sector-12, Karnal - HSPCB', id: 'sector-12-karnal-hspcb' },
        ]
      },
      {
        city: 'Kurukshetra',
        stations: [
          { name: 'Sector-7, Kurukshetra - HSPCB', id: 'sector-7-kurukshetra-hspcb' },
        ]
      },
      {
        city: 'Mandikhera',
        stations: [
          { name: 'General Hospital, Mandikhera(Nuh) - HSPCB', id: 'general-hospital-mandikhera-nuh-hspcb' },
        ]
      },
      {
        city: 'Manesar',
        stations: [
          { name: 'Sector-2 IMT, Manesar - HSPCB', id: 'sector-2-imt-manesar-hspcb' },
        ]
      },
      {
        city: 'Narnaul',
        stations: [
          { name: 'Shastri Nagar, Narnaul - HSPCB', id: 'shastri-nagar-narnaul-hspcb' },
        ]
      },
      {
        city: 'Palwal',
        stations: [
          { name: 'Shyam Nagar, Palwal - HSPCB', id: 'shyam-nagar-palwal-hspcb' },
        ]
      },
      {
        city: 'Panchgaon',
        stations: [
          { name: 'Amity University, Panchgaon - IITM', id: 'amity-university-panchgaon-iitm' },
        ]
      },
      {
        city: 'Panchkula',
        stations: [
          { name: 'Sector-6, Panchkula - HSPCB', id: 'sector-6-panchkula-hspcb' },
        ]
      },
      {
        city: 'Panipat',
        stations: [
          { name: 'Sector-18, Panipat - HSPCB', id: 'sector-18-panipat-hspcb' },
        ]
      },
      {
        city: 'Rohtak',
        stations: [
          { name: 'MD University, Rohtak - HSPCB', id: 'md-university-rohtak-hspcb' },
        ]
      },
      {
        city: 'Sirsa',
        stations: [
          { name: 'F-Block, Sirsa - HSPCB', id: 'f-block-sirsa-hspcb' },
        ]
      },
      {
        city: 'Sonipat',
        stations: [
          { name: 'Murthal, Sonipat - HSPCB', id: 'murthal-sonipat-hspcb' },
        ]
      },
      {
        city: 'Yamuna Nagar',
        stations: [
          { name: 'Gobind Pura, Yamuna Nagar - HSPCB', id: 'gobind-pura-yamuna-nagar-hspcb' },
        ]
      },
    ]
  },
  {
    state: 'Himachal Pradesh',
    cities: [
      {
        city: 'Baddi',
        stations: [
          { name: 'HIMUDA Complex Phase-1, Baddi - HPPCB', id: 'himuda-complex-phase-1-baddi-hppcb' },
        ]
      },
    ]
  },
  {
    state: 'Jammu and Kashmir',
    cities: [
      {
        city: 'Pampore',
        stations: [
          { name: 'Khrew, Pampore - JKPCC', id: 'khrew-pampore-jkpcc' },
        ]
      },
      {
        city: 'Srinagar',
        stations: [
          { name: 'Khunmoh, Srinagar - JKPCC', id: 'khunmoh-srinagar-jkpcc' },
          { name: 'Rajbagh, Srinagar - JKPCC', id: 'rajbagh-srinagar-jkpcc' },
        ]
      },
    ]
  },
  {
    state: 'Jharkhand',
    cities: [
      {
        city: 'Dhanbad',
        stations: [
          { name: 'Kalakusuma, Dhanbad - DMC', id: 'kalakusuma-dhanbad-dmc' },
          { name: 'Sardar Patel Nagar, Dhanbad - JSPCB', id: 'sardar-patel-nagar-dhanbad-jspcb' },
        ]
      },
      {
        city: 'Jorapokhar',
        stations: [
          { name: 'Tata Stadium, Jorapokhar - JSPCB', id: 'tata-stadium-jorapokhar-jspcb' },
        ]
      },
      {
        city: 'Pathardih',
        stations: [
          { name: 'Mohalbani Ghat, Pathardih - DMC', id: 'mohalbani-ghat-pathardih-dmc' },
        ]
      },
    ]
  },
  {
    state: 'Karnataka',
    cities: [
      {
        city: 'Bagalkot',
        stations: [
          { name: 'Vidayagiri, Bagalkot - KSPCB', id: 'vidayagiri-bagalkot-kspcb' },
        ]
      },
      {
        city: 'Belgaum',
        stations: [
          { name: 'Ramteerth Nagar, Belgaum - KSPCB', id: 'ramteerth-nagar-belgaum-kspcb' },
        ]
      },
      {
        city: 'Bengaluru',
        stations: [
          { name: 'BTM Layout, Bengaluru - CPCB', id: 'btm-layout-bengaluru-cpcb' },
          { name: 'BWSSB Kadabesanahalli, Bengaluru - CPCB', id: 'bwssb-kadabesanahalli-bengaluru-cpcb' },
          { name: 'Bapuji Nagar, Bengaluru - KSPCB', id: 'bapuji-nagar-bengaluru-kspcb' },
          { name: 'City Railway Station, Bengaluru - KSPCB', id: 'city-railway-station-bengaluru-kspcb' },
          { name: 'Hebbal, Bengaluru - KSPCB', id: 'hebbal-bengaluru-kspcb' },
          { name: 'Hombegowda Nagar, Bengaluru - KSPCB', id: 'hombegowda-nagar-bengaluru-kspcb' },
          { name: 'Jayanagar 5th Block, Bengaluru - KSPCB', id: 'jayanagar-5th-block-bengaluru-kspcb' },
          { name: 'Jigani, Bengaluru - KSPCB', id: 'jigani-bengaluru-kspcb' },
          { name: 'Kasturi Nagar, Bengaluru - KSPCB', id: 'kasturi-nagar-bengaluru-kspcb' },
          { name: 'Peenya, Bengaluru - CPCB', id: 'peenya-bengaluru-cpcb' },
          { name: 'RVCE-Mailasandra, Bengaluru - KSPCB', id: 'rvce-mailasandra-bengaluru-kspcb' },
          { name: 'Sanegurava Halli, Bengaluru - KSPCB', id: 'sanegurava-halli-bengaluru-kspcb' },
          { name: 'Shivapura_Peenya, Bengaluru - KSPCB', id: 'shivapura-peenya-bengaluru-kspcb' },
          { name: 'Silk Board, Bengaluru - KSPCB', id: 'silk-board-bengaluru-kspcb' },
        ]
      },
      {
        city: 'Bidar',
        stations: [
          { name: 'Naubad, Bidar - KSPCB', id: 'naubad-bidar-kspcb' },
        ]
      },
      {
        city: 'Chamarajanagar',
        stations: [
          { name: 'Urban, Chamarajanagar - KSPCB', id: 'urban-chamarajanagar-kspcb' },
        ]
      },
      {
        city: 'Chikkaballapur',
        stations: [
          { name: 'Chikkaballapur Rural, Chikkaballapur - KSPCB', id: 'chikkaballapur-rural-chikkaballapur-kspcb' },
        ]
      },
      {
        city: 'Chikkamagaluru',
        stations: [
          { name: 'Kalyana Nagara, Chikkamagaluru - KSPCB', id: 'kalyana-nagara-chikkamagaluru-kspcb' },
        ]
      },
      {
        city: 'Davanagere',
        stations: [
          { name: 'Devaraj Urs Badavane, Davanagere - KSPCB', id: 'devaraj-urs-badavane-davanagere-kspcb' },
        ]
      },
      {
        city: 'Dharwad',
        stations: [
          { name: 'Kalabhavan, Dharwad - KSPCB', id: 'kalabhavan-dharwad-kspcb' },
        ]
      },
      {
        city: 'Gadag',
        stations: [
          { name: 'Panchal Nagar, Gadag - KSPCB', id: 'panchal-nagar-gadag-kspcb' },
        ]
      },
      {
        city: 'Hassan',
        stations: [
          { name: 'B.Katihalli, Hassan - KSPCB', id: 'b-katihalli-hassan-kspcb' },
        ]
      },
      {
        city: 'Haveri',
        stations: [
          { name: 'Ashwini Nagar, Haveri - KSPCB', id: 'ashwini-nagar-haveri-kspcb' },
        ]
      },
      {
        city: 'Hubballi',
        stations: [
          { name: 'Deshpande Nagar, Hubballi - KSPCB', id: 'deshpande-nagar-hubballi-kspcb' },
          { name: 'Lingaraj Nagar, Hubballi - KSPCB', id: 'lingaraj-nagar-hubballi-kspcb' },
        ]
      },
      {
        city: 'Kalaburagi',
        stations: [
          { name: 'Lal Bahadur Shastri Nagar, Kalaburagi - KSPCB', id: 'lal-bahadur-shastri-nagar-kalaburagi-kspcb' },
          { name: 'Mahatma Basaveswar Colony, Kalaburgi - KSPCB', id: 'mahatma-basaveswar-colony-kalaburgi-kspcb' },
        ]
      },
      {
        city: 'Karwar',
        stations: [
          { name: 'KHB Colony, Karwar - KSPCB', id: 'khb-colony-karwar-kspcb' },
        ]
      },
      {
        city: 'Kolar',
        stations: [
          { name: 'Tamaka Ind. Area, Kolar - KSPCB', id: 'tamaka-ind-area-kolar-kspcb' },
        ]
      },
      {
        city: 'Koppal',
        stations: [
          { name: 'Diwator Nagar, Koppal - KSPCB', id: 'diwator-nagar-koppal-kspcb' },
        ]
      },
      {
        city: 'Madikeri',
        stations: [
          { name: 'Stuart Hill, Madikeri - KSPCB', id: 'stuart-hill-madikeri-kspcb' },
        ]
      },
      {
        city: 'Mangalore',
        stations: [
          { name: 'Kadri, Mangalore - KSPCB', id: 'kadri-mangalore-kspcb' },
        ]
      },
      {
        city: 'Mysuru',
        stations: [
          { name: 'Hebbal 1st Stage, Mysuru - KSPCB', id: 'hebbal-1st-stage-mysuru-kspcb' },
        ]
      },
      {
        city: 'Raichur',
        stations: [
          { name: 'Haji Colony, Raichur - KSPCB', id: 'haji-colony-raichur-kspcb' },
        ]
      },
      {
        city: 'Ramanagara',
        stations: [
          { name: 'Vijay Nagar, Ramanagara - KSPCB', id: 'vijay-nagar-ramanagara-kspcb' },
        ]
      },
      {
        city: 'Shivamogga',
        stations: [
          { name: 'Vinoba Nagara, Shivamogga - KSPCB', id: 'vinoba-nagara-shivamogga-kspcb' },
        ]
      },
      {
        city: 'Tumakuru',
        stations: [
          { name: 'Thimmalapura, Tumakuru - KSPCB', id: 'thimmalapura-tumakuru-kspcb' },
        ]
      },
      {
        city: 'Udupi',
        stations: [
          { name: 'Brahmagiri, Udupi - KSPCB', id: 'brahmagiri-udupi-kspcb' },
        ]
      },
      {
        city: 'Vijayapura',
        stations: [
          { name: 'Ibrahimpur, Vijayapura - KSPCB', id: 'ibrahimpur-vijayapura-kspcb' },
        ]
      },
      {
        city: 'Yadgir',
        stations: [
          { name: 'Collector Office, Yadgir - KSPCB', id: 'collector-office-yadgir-kspcb' },
        ]
      },
    ]
  },
  {
    state: 'Kerala',
    cities: [
      {
        city: 'Eloor',
        stations: [
          { name: 'Udyogamandal, Eloor - Kerala PCB', id: 'udyogamandal-eloor-kerala-pcb' },
        ]
      },
      {
        city: 'Ernakulam',
        stations: [
          { name: 'Kacheripady, Ernakulam - Kerala PCB', id: 'kacheripady-ernakulam-kerala-pcb' },
        ]
      },
      {
        city: 'Kannur',
        stations: [
          { name: 'Thavakkara, Kannur - Kerala PCB', id: 'thavakkara-kannur-kerala-pcb' },
        ]
      },
      {
        city: 'Kochi',
        stations: [
          { name: 'Vyttila, Kochi - Kerala PCB', id: 'vyttila-kochi-kerala-pcb' },
        ]
      },
      {
        city: 'Kollam',
        stations: [
          { name: 'Polayathode, Kollam - Kerala PCB', id: 'polayathode-kollam-kerala-pcb' },
        ]
      },
      {
        city: 'Kozhikode',
        stations: [
          { name: 'Palayam, Kozhikode - Kerala PCB', id: 'palayam-kozhikode-kerala-pcb' },
        ]
      },
      {
        city: 'Thiruvananthapuram',
        stations: [
          { name: 'Kariavattom, Thiruvananthapuram - Kerala PCB', id: 'kariavattom-thiruvananthapuram-kerala-pcb' },
          { name: 'Plammoodu, Thiruvananthapuram - Kerala PCB', id: 'plammoodu-thiruvananthapuram-kerala-pcb' },
        ]
      },
      {
        city: 'Thrissur',
        stations: [
          { name: 'Corporation Ground, Thrissur - Kerala PCB', id: 'corporation-ground-thrissur-kerala-pcb' },
        ]
      },
    ]
  },
  {
    state: 'Madhya Pradesh',
    cities: [
      {
        city: 'Bhopal',
        stations: [
          { name: 'Idgah Hills, Bhopal - MPPCB', id: 'idgah-hills-bhopal-mppcb' },
          { name: 'Paryavaran Parisar, Bhopal - MPPCB', id: 'paryavaran-parisar-bhopal-mppcb' },
          { name: 'T T Nagar, Bhopal - MPPCB', id: 't-t-nagar-bhopal-mppcb' },
        ]
      },
      {
        city: 'Damoh',
        stations: [
          { name: 'Shrivastav Colony, Damoh - MPPCB', id: 'shrivastav-colony-damoh-mppcb' },
        ]
      },
      {
        city: 'Dewas',
        stations: [
          { name: 'Bhopal Chauraha, Dewas - MPPCB', id: 'bhopal-chauraha-dewas-mppcb' },
        ]
      },
      {
        city: 'Gwalior',
        stations: [
          { name: 'City Center, Gwalior - MPPCB', id: 'city-center-gwalior-mppcb' },
          { name: 'Deen Dayal Nagar, Gwalior - MPPCB', id: 'deen-dayal-nagar-gwalior-mppcb' },
          { name: 'Maharaj Bada, Gwalior - MPPCB', id: 'maharaj-bada-gwalior-mppcb' },
          { name: 'Phool Bagh, Gwalior - Mondelez Ind. Food', id: 'phool-bagh-gwalior-mondelez-ind-food' },
        ]
      },
      {
        city: 'Indore',
        stations: [
          { name: 'Airport Area, Indore - IMC', id: 'airport-area-indore-imc' },
          { name: 'Chhoti Gwaltoli, Indore - MPPCB', id: 'chhoti-gwaltoli-indore-mppcb' },
          { name: 'Maguda Nagar, Indore - IMC', id: 'maguda-nagar-indore-imc' },
          { name: 'Regional Park, Indore - IMC', id: 'regional-park-indore-imc' },
          { name: 'Residency Area, Indore - IMC', id: 'residency-area-indore-imc' },
          { name: 'Vijay Nagar Scheme-78, Indore - Glenmark', id: 'vijay-nagar-scheme-78-indore-glenmark' },
        ]
      },
      {
        city: 'Jabalpur',
        stations: [
          { name: 'Govindh Bhavan Colony, Jabalpur - JMC', id: 'govindh-bhavan-colony-jabalpur-jmc' },
          { name: 'Gupteshwar, Jabalpur - JMC', id: 'gupteshwar-jabalpur-jmc' },
          { name: 'Marhatal, Jabalpur - MPPCB', id: 'marhatal-jabalpur-mppcb' },
          { name: 'Suhagi, Jabalpur - JMC', id: 'suhagi-jabalpur-jmc' },
        ]
      },
      {
        city: 'Katni',
        stations: [
          { name: 'Gole Bazar, Katni - MPPCB', id: 'gole-bazar-katni-mppcb' },
        ]
      },
      {
        city: 'Maihar',
        stations: [
          { name: 'Sahilara, Maihar - KJS Cements', id: 'sahilara-maihar-kjs-cements' },
        ]
      },
      {
        city: 'Mandideep',
        stations: [
          { name: 'Sector-D Industrial Area, Mandideep - MPPCB', id: 'sector-d-industrial-area-mandideep-mppcb' },
        ]
      },
      {
        city: 'Pithampur',
        stations: [
          { name: 'Sector-2 Industrial Area, Pithampur - MPPCB', id: 'sector-2-industrial-area-pithampur-mppcb' },
        ]
      },
      {
        city: 'Ratlam',
        stations: [
          { name: 'Shasthri Nagar, Ratlam - IPCA Lab', id: 'shasthri-nagar-ratlam-ipca-lab' },
        ]
      },
      {
        city: 'Sagar',
        stations: [
          { name: 'Civil Lines, Sagar - MPPCB', id: 'civil-lines-sagar-mppcb' },
          { name: 'Deen Dayal Nagar, Sagar - MPPCB', id: 'deen-dayal-nagar-sagar-mppcb' },
        ]
      },
      {
        city: 'Satna',
        stations: [
          { name: 'Bandhavgar Colony, Satna - Birla Cement', id: 'bandhavgar-colony-satna-birla-cement' },
        ]
      },
      {
        city: 'Singrauli',
        stations: [
          { name: 'Suryakiran Bhawan NCL, Singrauli - MPPCB', id: 'suryakiran-bhawan-ncl-singrauli-mppcb' },
        ]
      },
      {
        city: 'Ujjain',
        stations: [
          { name: 'Mahakaleshwar Temple, Ujjain - MPPCB', id: 'mahakaleshwar-temple-ujjain-mppcb' },
          { name: 'Mahashweta Nagar, Ujjain - MPPCB', id: 'mahashweta-nagar-ujjain-mppcb' },
        ]
      },
    ]
  },
  {
    state: 'Maharashtra',
    cities: [
      {
        city: 'Ahmednagar',
        stations: [
          { name: 'Tarakpur, Ahmednagar - MPCB', id: 'tarakpur-ahmednagar-mpcb' },
        ]
      },
      {
        city: 'Akola',
        stations: [
          { name: 'Ramdaspeth, Akola - MPCB', id: 'ramdaspeth-akola-mpcb' },
        ]
      },
      {
        city: 'Ambernath',
        stations: [
          { name: 'Chinchpada, Ambernath - MPCB', id: 'chinchpada-ambernath-mpcb' },
        ]
      },
      {
        city: 'Amravati',
        stations: [
          { name: 'Shivneri Colony, Amravati - MPCB', id: 'shivneri-colony-amravati-mpcb' },
          { name: 'Shri Shivaji Science College, Amravati - MPCB', id: 'shri-shivaji-science-college-amravati-mpcb' },
        ]
      },
      {
        city: 'Aurangabad',
        stations: [
          { name: 'MIDC Chilkalthana, Aurangabad - MPCB', id: 'midc-chilkalthana-aurangabad-mpcb' },
          { name: 'More Chowk Waluj, Aurangabad - MPCB', id: 'more-chowk-waluj-aurangabad-mpcb' },
          { name: 'Rachnakar Colony, Aurangabad - MPCB', id: 'rachnakar-colony-aurangabad-mpcb' },
        ]
      },
      {
        city: 'Badlapur',
        stations: [
          { name: 'Katrap, Badlapur - MPCB', id: 'katrap-badlapur-mpcb' },
        ]
      },
      {
        city: 'Beed',
        stations: [
          { name: 'Bir, Beed - MPCB', id: 'bir-beed-mpcb' },
        ]
      },
      {
        city: 'Belapur',
        stations: [
          { name: 'CBD Belapur, Belapur - MPCB', id: 'cbd-belapur-belapur-mpcb' },
        ]
      },
      {
        city: 'Bhiwandi',
        stations: [
          { name: 'Gokul Nagar, Bhiwandi - MPCB', id: 'gokul-nagar-bhiwandi-mpcb' },
        ]
      },
      {
        city: 'Boisar',
        stations: [
          { name: 'Khaira, Boisar - MPCB', id: 'khaira-boisar-mpcb' },
        ]
      },
      {
        city: 'Chandrapur',
        stations: [
          { name: 'Chauhan Colony, Chandrapur - MPCB', id: 'chauhan-colony-chandrapur-mpcb' },
          { name: 'MIDC Khutala, Chandrapur - MPCB', id: 'midc-khutala-chandrapur-mpcb' },
        ]
      },
      {
        city: 'Dhule',
        stations: [
          { name: 'Deopur, Dhule - MPCB', id: 'deopur-dhule-mpcb' },
        ]
      },
      {
        city: 'Dombivli',
        stations: [
          { name: 'Kalu Nagar, Dombivli - MPCB', id: 'kalu-nagar-dombivli-mpcb' },
        ]
      },
      {
        city: 'Hingoli',
        stations: [
          { name: 'Ashta Vinayak Nagar, Hingoli - MPCB', id: 'ashta-vinayak-nagar-hingoli-mpcb' },
        ]
      },
      {
        city: 'Jalgaon',
        stations: [
          { name: 'Prabhat Colony, Jalgaon - MPCB', id: 'prabhat-colony-jalgaon-mpcb' },
        ]
      },
      {
        city: 'Jalna',
        stations: [
          { name: 'Old MIDC, Jalna - MPCB', id: 'old-midc-jalna-mpcb' },
        ]
      },
      {
        city: 'Kalyan',
        stations: [
          { name: 'Khadakpada, Kalyan - MPCB', id: 'khadakpada-kalyan-mpcb' },
          { name: 'Pimpleshwar Mandir, Kalyan - MPCB', id: 'pimpleshwar-mandir-kalyan-mpcb' },
        ]
      },
      {
        city: 'Kolhapur',
        stations: [
          { name: 'Shivaji University, Kolhapur - MPCB', id: 'shivaji-university-kolhapur-mpcb' },
          { name: 'Sinchan Bhavan, Kolhapur - MPCB', id: 'sinchan-bhavan-kolhapur-mpcb' },
        ]
      },
      {
        city: 'Latur',
        stations: [
          { name: 'Sawe Wadi, Latur - MPCB', id: 'sawe-wadi-latur-mpcb' },
        ]
      },
      {
        city: 'Mahad',
        stations: [
          { name: 'Kamble Tarf Birwadi, Mahad - MPCB', id: 'kamble-tarf-birwadi-mahad-mpcb' },
        ]
      },
      {
        city: 'Malegaon',
        stations: [
          { name: 'Mahesh Nagar, Malegaon - MPCB', id: 'mahesh-nagar-malegaon-mpcb' },
        ]
      },
      {
        city: 'Mira-Bhayandar',
        stations: [
          { name: 'Bhayandar West, Mira-Bhayandar - MPCB', id: 'bhayandar-west-mira-bhayandar-mpcb' },
        ]
      },
      {
        city: 'Mumbai',
        stations: [
          { name: 'Bandra Kurla Complex, Mumbai - IITM', id: 'bandra-kurla-complex-mumbai-iitm' },
          { name: 'Bandra Kurla Complex, Mumbai - MPCB', id: 'bandra-kurla-complex-mumbai-mpcb' },
          { name: 'Bandra, Mumbai - MPCB', id: 'bandra-mumbai-mpcb' },
          { name: 'Borivali East, Mumbai - IITM', id: 'borivali-east-mumbai-iitm' },
          { name: 'Borivali East, Mumbai - MPCB', id: 'borivali-east-mumbai-mpcb' },
          { name: 'Byculla, Mumbai - BMC', id: 'byculla-mumbai-bmc' },
          { name: 'Chakala-Andheri East, Mumbai - IITM', id: 'chakala-andheri-east-mumbai-iitm' },
          { name: 'Chembur, Mumbai - MPCB', id: 'chembur-mumbai-mpcb' },
          { name: 'Chhatrapati Shivaji Intl. Airport (T2), Mumbai - MPCB', id: 'chhatrapati-shivaji-intl-airport-t2-mumbai-mpcb' },
          { name: 'Colaba, Mumbai - MPCB', id: 'colaba-mumbai-mpcb' },
          { name: 'Deonar, Mumbai - IITM', id: 'deonar-mumbai-iitm' },
          { name: 'Ghatkopar, Mumbai - BMC', id: 'ghatkopar-mumbai-bmc' },
          { name: 'Kandivali East, Mumbai - MPCB', id: 'kandivali-east-mumbai-mpcb' },
          { name: 'Kandivali West, Mumbai - BMC', id: 'kandivali-west-mumbai-bmc' },
          { name: 'Kherwadi_Bandra East, Mumbai - MPCB', id: 'kherwadi-bandra-east-mumbai-mpcb' },
          { name: 'Khindipada-Bhandup West, Mumbai - IITM', id: 'khindipada-bhandup-west-mumbai-iitm' },
          { name: 'Kurla, Mumbai - MPCB', id: 'kurla-mumbai-mpcb' },
          { name: 'Malad West, Mumbai - IITM', id: 'malad-west-mumbai-iitm' },
          { name: 'Mazgaon, Mumbai - IITM', id: 'mazgaon-mumbai-iitm' },
          { name: 'Mindspace-Malad West, Mumbai - MPCB', id: 'mindspace-malad-west-mumbai-mpcb' },
          { name: 'Mulund West, Mumbai - MPCB', id: 'mulund-west-mumbai-mpcb' },
          { name: 'Navy Nagar-Colaba, Mumbai - IITM', id: 'navy-nagar-colaba-mumbai-iitm' },
          { name: 'Powai, Mumbai - MPCB', id: 'powai-mumbai-mpcb' },
          { name: 'Sewri, Mumbai - BMC', id: 'sewri-mumbai-bmc' },
          { name: 'Shivaji Nagar, Mumbai - BMC', id: 'shivaji-nagar-mumbai-bmc' },
          { name: 'Siddharth Nagar-Worli, Mumbai - IITM', id: 'siddharth-nagar-worli-mumbai-iitm' },
          { name: 'Sion, Mumbai - MPCB', id: 'sion-mumbai-mpcb' },
          { name: 'Vasai West, Mumbai - MPCB', id: 'vasai-west-mumbai-mpcb' },
          { name: 'Vile Parle West, Mumbai - MPCB', id: 'vile-parle-west-mumbai-mpcb' },
          { name: 'Worli, Mumbai -MPCB', id: 'worli-mumbai-mpcb' },
        ]
      },
      {
        city: 'Nagpur',
        stations: [
          { name: 'Ambazari, Nagpur - MPCB', id: 'ambazari-nagpur-mpcb' },
          { name: 'Mahal, Nagpur - MPCB', id: 'mahal-nagpur-mpcb' },
          { name: 'Opp GPO Civil Lines, Nagpur - MPCB', id: 'opp-gpo-civil-lines-nagpur-mpcb' },
          { name: 'Ram Nagar, Nagpur - MPCB', id: 'ram-nagar-nagpur-mpcb' },
        ]
      },
      {
        city: 'Nanded',
        stations: [
          { name: 'Sneh Nagar, Nanded - MPCB', id: 'sneh-nagar-nanded-mpcb' },
        ]
      },
      {
        city: 'Nashik',
        stations: [
          { name: 'Gangapur Road, Nashik - MPCB', id: 'gangapur-road-nashik-mpcb' },
          { name: 'Hirawadi, Nashik - MPCB', id: 'hirawadi-nashik-mpcb' },
          { name: 'MIDC Ambad, Nashik - MPCB', id: 'midc-ambad-nashik-mpcb' },
          { name: 'Pandav Nagari, Nashik - MPCB', id: 'pandav-nagari-nashik-mpcb' },
        ]
      },
      {
        city: 'Navi Mumbai',
        stations: [
          { name: 'Airoli, Navi Mumbai - MPCB', id: 'airoli-navi-mumbai-mpcb' },
          { name: 'Kopripada-Vashi, Navi Mumbai - MPCB', id: 'kopripada-vashi-navi-mumbai-mpcb' },
          { name: 'Mahape, Navi Mumbai - MPCB', id: 'mahape-navi-mumbai-mpcb' },
          { name: 'Nerul, Navi Mumbai - MPCB', id: 'nerul-navi-mumbai-mpcb' },
          { name: 'Sanpada, Navi Mumbai - MPCB', id: 'sanpada-navi-mumbai-mpcb' },
          { name: 'Sector-19A Nerul, Navi Mumbai - IITM', id: 'sector-19a-nerul-navi-mumbai-iitm' },
          { name: 'Sector-2E Kalamboli, Navi Mumbai - MPCB', id: 'sector-2e-kalamboli-navi-mumbai-mpcb' },
          { name: 'Tondare-Taloja, Navi Mumbai - MPCB', id: 'tondare-taloja-navi-mumbai-mpcb' },
        ]
      },
      {
        city: 'Parbhani',
        stations: [
          { name: 'Masoom Colony, Parbhani - MPCB', id: 'masoom-colony-parbhani-mpcb' },
        ]
      },
      {
        city: 'Pimpri-Chinchwad',
        stations: [
          { name: 'Alandi, Pune - IITM', id: 'alandi-pune-iitm' },
          { name: 'Bhosari, Pune - IITM', id: 'bhosari-pune-iitm' },
          { name: 'Bhumkar Nagar, Pune - IITM', id: 'bhumkar-nagar-pune-iitm' },
          { name: 'Gavalinagar, Pimpri Chinchwad - MPCB', id: 'gavalinagar-pimpri-chinchwad-mpcb' },
          { name: 'Park Street Wakad, Pimpri Chinchwad - MPCB', id: 'park-street-wakad-pimpri-chinchwad-mpcb' },
          { name: 'Savta Mali Nagar, Pimpri-Chinchwad - IITM', id: 'savta-mali-nagar-pimpri-chinchwad-iitm' },
          { name: 'Thergaon, Pimpri Chinchwad - MPCB', id: 'thergaon-pimpri-chinchwad-mpcb' },
          { name: 'Transport Nagar-Nigdi, Pune - IITM', id: 'transport-nagar-nigdi-pune-iitm' },
        ]
      },
      {
        city: 'Pune',
        stations: [
          { name: 'Dhankawadi, Pune - IITM', id: 'dhankawadi-pune-iitm' },
          { name: 'Hadapsar, Pune - IITM', id: 'hadapsar-pune-iitm' },
          { name: 'Karve Road, Pune - MPCB', id: 'karve-road-pune-mpcb' },
          { name: 'Katraj Dairy, Pune - MPCB', id: 'katraj-dairy-pune-mpcb' },
          { name: 'MIT-Kothrud, Pune - IITM', id: 'mit-kothrud-pune-iitm' },
          { name: 'Mhada Colony, Pune - IITM', id: 'mhada-colony-pune-iitm' },
          { name: 'Panchawati_Pashan, Pune - IITM', id: 'panchawati-pashan-pune-iitm' },
          { name: 'Revenue Colony-Shivajinagar, Pune - IITM', id: 'revenue-colony-shivajinagar-pune-iitm' },
          { name: 'Savitribai Phule Pune University, Pune - MPCB', id: 'savitribai-phule-pune-university-pune-mpcb' },
        ]
      },
      {
        city: 'Sangli',
        stations: [
          { name: 'Vijay Nagar, Sangli - MPCB', id: 'vijay-nagar-sangli-mpcb' },
        ]
      },
      {
        city: 'Solapur',
        stations: [
          { name: 'Dnyaneshwar Nagar, Solapur - MPCB', id: 'dnyaneshwar-nagar-solapur-mpcb' },
          { name: 'Ratandeep Housing Society, Solapur - MPCB', id: 'ratandeep-housing-society-solapur-mpcb' },
          { name: 'Solapur, Solapur - MPCB', id: 'solapur-solapur-mpcb' },
        ]
      },
      {
        city: 'Thane',
        stations: [
          { name: 'Kasarvadavali, Thane - MPCB', id: 'kasarvadavali-thane-mpcb' },
          { name: 'Upvan Fort, Thane - MPCB', id: 'upvan-fort-thane-mpcb' },
        ]
      },
      {
        city: 'Ulhasnagar',
        stations: [
          { name: 'Sidhi Vinayak Nagar, Ulhasnagar - MPCB', id: 'sidhi-vinayak-nagar-ulhasnagar-mpcb' },
          { name: 'Vithalwadi, Ulhasnagar - MPCB', id: 'vithalwadi-ulhasnagar-mpcb' },
        ]
      },
      {
        city: 'Virar',
        stations: [
          { name: 'Bolinj, Virar - MPCB', id: 'bolinj-virar-mpcb' },
        ]
      },
    ]
  },
  {
    state: 'Manipur',
    cities: [
      {
        city: 'Imphal',
        stations: [
          { name: 'DM College of Science, Imphal - Manipur PCB', id: 'dm-college-of-science-imphal-manipur-pcb' },
          { name: 'Manipur University, Imphal - Manipur PCB', id: 'manipur-university-imphal-manipur-pcb' },
        ]
      },
    ]
  },
  {
    state: 'Meghalaya',
    cities: [
      {
        city: 'Byrnihat',
        stations: [
          { name: '15th Mile-Nongthymmai, Byrnihat - Meghalaya PCB', id: '15th-mile-nongthymmai-byrnihat-meghalaya-pcb' },
        ]
      },
      {
        city: 'Shillong',
        stations: [
          { name: 'JN Stadium, Shillong - Meghalaya PCB', id: 'jn-stadium-shillong-meghalaya-pcb' },
          { name: 'Lumpyngngad, Shillong - Meghalaya PCB', id: 'lumpyngngad-shillong-meghalaya-pcb' },
        ]
      },
    ]
  },
  {
    state: 'Mizoram',
    cities: [
      {
        city: 'Aizawl',
        stations: [
          { name: 'Sikulpuikawn, Aizawl - Mizoram PCB', id: 'sikulpuikawn-aizawl-mizoram-pcb' },
        ]
      },
    ]
  },
  {
    state: 'Nagaland',
    cities: [
      {
        city: 'Kohima',
        stations: [
          { name: 'PWD Junction, Kohima - NPCB', id: 'pwd-junction-kohima-npcb' },
        ]
      },
    ]
  },
  {
    state: 'Odisha',
    cities: [
      {
        city: 'Angul',
        stations: [
          { name: 'Hakimapada, Angul - OSPCB', id: 'hakimapada-angul-ospcb' },
        ]
      },
      {
        city: 'Balasore',
        stations: [
          { name: 'Kalidaspur, Balasore - OSPCB', id: 'kalidaspur-balasore-ospcb' },
        ]
      },
      {
        city: 'Barbil',
        stations: [
          { name: 'Forest Office, Barbil - OSPCB', id: 'forest-office-barbil-ospcb' },
        ]
      },
      {
        city: 'Baripada',
        stations: [
          { name: 'Meher Colony, Baripada - OSPCB', id: 'meher-colony-baripada-ospcb' },
        ]
      },
      {
        city: 'Bhubaneswar',
        stations: [
          { name: 'Lingraj Mandir, Bhubaneswar - OSPCB', id: 'lingraj-mandir-bhubaneswar-ospcb' },
          { name: 'Patia, Bhubaneswar - OSPCB', id: 'patia-bhubaneswar-ospcb' },
        ]
      },
      {
        city: 'Bileipada',
        stations: [
          { name: 'Tata Township, Bileipada - OSPCB', id: 'tata-township-bileipada-ospcb' },
        ]
      },
      {
        city: 'Brajrajnagar',
        stations: [
          { name: 'GM Office, Brajrajnagar - OSPCB', id: 'gm-office-brajrajnagar-ospcb' },
        ]
      },
      {
        city: 'Byasanagar',
        stations: [
          { name: 'Ferro Chrome Colony, Byasanagar - OSPCB', id: 'ferro-chrome-colony-byasanagar-ospcb' },
        ]
      },
      {
        city: 'Cuttack',
        stations: [
          { name: 'CDA Area, Cuttack - OSPCB', id: 'cda-area-cuttack-ospcb' },
        ]
      },
      {
        city: 'Keonjhar',
        stations: [
          { name: 'Jagamohanpur, Keonjhar - OSPCB', id: 'jagamohanpur-keonjhar-ospcb' },
        ]
      },
      {
        city: 'Nayagarh',
        stations: [
          { name: 'Dabuna, Nayagarh - OSPCB', id: 'dabuna-nayagarh-ospcb' },
        ]
      },
      {
        city: 'Rairangpur',
        stations: [
          { name: 'Divisional Forest Office, Rairangpur - OSPCB', id: 'divisional-forest-office-rairangpur-ospcb' },
        ]
      },
      {
        city: 'Rourkela',
        stations: [
          { name: 'Fertilizer Township, Rourkela - OSPCB', id: 'fertilizer-township-rourkela-ospcb' },
          { name: 'Raghunathpali, Rourkela - OSPCB', id: 'raghunathpali-rourkela-ospcb' },
          { name: 'Sector-2, Rourkela - OSPCB', id: 'sector-2-rourkela-ospcb' },
        ]
      },
      {
        city: 'Suakati',
        stations: [
          { name: 'OMC Colony, Suakati - OSPCB', id: 'omc-colony-suakati-ospcb' },
        ]
      },
      {
        city: 'Talcher',
        stations: [
          { name: 'Talcher Coalfields,Talcher - OSPCB', id: 'talcher-coalfields-talcher-ospcb' },
        ]
      },
      {
        city: 'Tensa',
        stations: [
          { name: 'Barsua Iron Ore Mines, Tensa - OSPCB', id: 'barsua-iron-ore-mines-tensa-ospcb' },
        ]
      },
    ]
  },
  {
    state: 'Puducherry',
    cities: [
      {
        city: 'Puducherry',
        stations: [
          { name: 'Jawahar Nagar, Puducherry - PPCC', id: 'jawahar-nagar-puducherry-ppcc' },
        ]
      },
    ]
  },
  {
    state: 'Punjab',
    cities: [
      {
        city: 'Amritsar',
        stations: [
          { name: 'Golden Temple, Amritsar - PPCB', id: 'golden-temple-amritsar-ppcb' },
        ]
      },
      {
        city: 'Bathinda',
        stations: [
          { name: 'Hardev Nagar, Bathinda - PPCB', id: 'hardev-nagar-bathinda-ppcb' },
        ]
      },
      {
        city: 'Jalandhar',
        stations: [
          { name: 'Civil Line, Jalandhar - PPCB', id: 'civil-line-jalandhar-ppcb' },
        ]
      },
      {
        city: 'Khanna',
        stations: [
          { name: 'Kalal Majra, Khanna - PPCB', id: 'kalal-majra-khanna-ppcb' },
        ]
      },
      {
        city: 'Ludhiana',
        stations: [
          { name: 'Punjab Agricultural University, Ludhiana - PPCB', id: 'punjab-agricultural-university-ludhiana-ppcb' },
        ]
      },
      {
        city: 'Mandi Gobindgarh',
        stations: [
          { name: 'RIMT University, Mandi Gobindgarh - PPCB', id: 'rimt-university-mandi-gobindgarh-ppcb' },
        ]
      },
      {
        city: 'Patiala',
        stations: [
          { name: 'Model Town, Patiala - PPCB', id: 'model-town-patiala-ppcb' },
        ]
      },
      {
        city: 'Rupnagar',
        stations: [
          { name: 'Ratanpura, Rupnagar - Ambuja Cements', id: 'ratanpura-rupnagar-ambuja-cements' },
        ]
      },
    ]
  },
  {
    state: 'Rajasthan',
    cities: [
      {
        city: 'Ajmer',
        stations: [
          { name: 'Civil Lines,  Ajmer - RSPCB', id: 'civil-lines-ajmer-rspcb' },
        ]
      },
      {
        city: 'Alwar',
        stations: [
          { name: 'Moti Doongri, Alwar - RSPCB', id: 'moti-doongri-alwar-rspcb' },
        ]
      },
      {
        city: 'Banswara',
        stations: [
          { name: 'Rati Talai, Banswara - RSPCB', id: 'rati-talai-banswara-rspcb' },
        ]
      },
      {
        city: 'Baran',
        stations: [
          { name: 'Bamboliya, Baran - RSPCB', id: 'bamboliya-baran-rspcb' },
        ]
      },
      {
        city: 'Barmer',
        stations: [
          { name: 'Railway Colony, Barmer - RSPCB', id: 'railway-colony-barmer-rspcb' },
        ]
      },
      {
        city: 'Bharatpur',
        stations: [
          { name: 'Krishna Nagar, Bharatpur - RSPCB', id: 'krishna-nagar-bharatpur-rspcb' },
        ]
      },
      {
        city: 'Bhilwara',
        stations: [
          { name: 'Pratap Nagar, Bhilwara - RSPCB', id: 'pratap-nagar-bhilwara-rspcb' },
        ]
      },
      {
        city: 'Bhiwadi',
        stations: [
          { name: 'RIICO Ind. Area III, Bhiwadi - RSPCB', id: 'riico-ind-area-iii-bhiwadi-rspcb' },
          { name: 'Vasundhara Nagar_UIT, Bhiwadi - RSPCB', id: 'vasundhara-nagar-uit-bhiwadi-rspcb' },
        ]
      },
      {
        city: 'Bikaner',
        stations: [
          { name: 'MM Ground, Bikaner - RSPCB', id: 'mm-ground-bikaner-rspcb' },
        ]
      },
      {
        city: 'Bundi',
        stations: [
          { name: 'New Colony, Bundi - RSPCB', id: 'new-colony-bundi-rspcb' },
        ]
      },
      {
        city: 'Chittorgarh',
        stations: [
          { name: 'Shastri Nagar, Chittorgarh - RSPCB', id: 'shastri-nagar-chittorgarh-rspcb' },
        ]
      },
      {
        city: 'Churu',
        stations: [
          { name: 'Subash Chowk, Churu - RSPCB', id: 'subash-chowk-churu-rspcb' },
        ]
      },
      {
        city: 'Dausa',
        stations: [
          { name: 'Khatikan Mohalla, Dausa - RSPCB', id: 'khatikan-mohalla-dausa-rspcb' },
        ]
      },
      {
        city: 'Dholpur',
        stations: [
          { name: 'Raja Ganj, Dholpur - RSPCB', id: 'raja-ganj-dholpur-rspcb' },
        ]
      },
      {
        city: 'Dungarpur',
        stations: [
          { name: 'Bhoiwada, Dungarpur - RSPCB', id: 'bhoiwada-dungarpur-rspcb' },
        ]
      },
      {
        city: 'Hanumangarh',
        stations: [
          { name: 'Housing Board, Hanumangarh - RSPCB', id: 'housing-board-hanumangarh-rspcb' },
        ]
      },
      {
        city: 'Jaipur',
        stations: [
          { name: 'Adarsh Nagar, Jaipur - RSPCB', id: 'adarsh-nagar-jaipur-rspcb' },
          { name: 'Mansarovar Sector-12, Jaipur - RSPCB', id: 'mansarovar-sector-12-jaipur-rspcb' },
          { name: 'Police Commissionerate, Jaipur - RSPCB', id: 'police-commissionerate-jaipur-rspcb' },
          { name: 'RIICO Sitapura, Jaipur - RSPCB', id: 'riico-sitapura-jaipur-rspcb' },
          { name: 'Sector-2 Murlipura, Jaipur - RSPCB', id: 'sector-2-murlipura-jaipur-rspcb' },
          { name: 'Shastri Nagar, Jaipur - RSPCB', id: 'shastri-nagar-jaipur-rspcb' },
        ]
      },
      {
        city: 'Jaisalmer',
        stations: [
          { name: 'Sadar Bazar, Jaisalmer - RSPCB', id: 'sadar-bazar-jaisalmer-rspcb' },
        ]
      },
      {
        city: 'Jalore',
        stations: [
          { name: 'Mudtra Sili, Jalore - RSPCB', id: 'mudtra-sili-jalore-rspcb' },
        ]
      },
      {
        city: 'Jhalawar',
        stations: [
          { name: 'Rajlaxmi Nagar, Jhalawar - RSPCB', id: 'rajlaxmi-nagar-jhalawar-rspcb' },
        ]
      },
      {
        city: 'Jhunjhunu',
        stations: [
          { name: 'Indra Nagar, Jhunjhunu - RSPCB', id: 'indra-nagar-jhunjhunu-rspcb' },
        ]
      },
      {
        city: 'Jodhpur',
        stations: [
          { name: 'Collectorate, Jodhpur - RSPCB', id: 'collectorate-jodhpur-rspcb' },
          { name: 'Digari Kalan, Jodhpur - RSPCB', id: 'digari-kalan-jodhpur-rspcb' },
          { name: 'Jhalamand, Jodhpur - RSPCB', id: 'jhalamand-jodhpur-rspcb' },
          { name: 'Mandor, Jodhpur - RSPCB', id: 'mandor-jodhpur-rspcb' },
          { name: 'Samrat Ashok Udhyan, Jodhpur - RSPCB', id: 'samrat-ashok-udhyan-jodhpur-rspcb' },
        ]
      },
      {
        city: 'Karauli',
        stations: [
          { name: 'Satyawati Vihar, Karauli - RSPCB', id: 'satyawati-vihar-karauli-rspcb' },
        ]
      },
      {
        city: 'Kota',
        stations: [
          { name: 'Dhanmandi, Kota - RSPCB', id: 'dhanmandi-kota-rspcb' },
          { name: 'Nayapura, Kota - RSPCB', id: 'nayapura-kota-rspcb' },
          { name: 'Shrinath Puram, Kota - RSPCB', id: 'shrinath-puram-kota-rspcb' },
        ]
      },
      {
        city: 'Nagaur',
        stations: [
          { name: 'Karni Colony, Nagaur - RSPCB', id: 'karni-colony-nagaur-rspcb' },
        ]
      },
      {
        city: 'Pali',
        stations: [
          { name: 'Indira Colony Vistar, Pali - RSPCB', id: 'indira-colony-vistar-pali-rspcb' },
        ]
      },
      {
        city: 'Pratapgarh',
        stations: [
          { name: 'Pragati Nagar, Pratapgarh - RSPCB', id: 'pragati-nagar-pratapgarh-rspcb' },
        ]
      },
      {
        city: 'Rajsamand',
        stations: [
          { name: 'Dhoinda, Rajsamand - RSPCB', id: 'dhoinda-rajsamand-rspcb' },
        ]
      },
      {
        city: 'Sawai Madhopur',
        stations: [
          { name: 'Sahu Nagar, Sawai Madhopur - RSPCB', id: 'sahu-nagar-sawai-madhopur-rspcb' },
        ]
      },
      {
        city: 'Sikar',
        stations: [
          { name: 'Radhakishan Pura, Sikar - RSPCB', id: 'radhakishan-pura-sikar-rspcb' },
        ]
      },
      {
        city: 'Sirohi',
        stations: [
          { name: 'Vedhaynath Colony, Sirohi - RSPCB', id: 'vedhaynath-colony-sirohi-rspcb' },
        ]
      },
      {
        city: 'Sri Ganganagar',
        stations: [
          { name: 'Old City, Sri Ganganagar - RSPCB', id: 'old-city-sri-ganganagar-rspcb' },
        ]
      },
      {
        city: 'Tonk',
        stations: [
          { name: 'Shastri Nagar, Tonk - RSPCB', id: 'shastri-nagar-tonk-rspcb' },
        ]
      },
      {
        city: 'Udaipur',
        stations: [
          { name: 'Ashok Nagar, Udaipur - RSPCB', id: 'ashok-nagar-udaipur-rspcb' },
        ]
      },
    ]
  },
  {
    state: 'Sikkim',
    cities: [
      {
        city: 'Gangtok',
        stations: [
          { name: 'Zero Point GICI, Gangtok - SSPCB', id: 'zero-point-gici-gangtok-sspcb' },
        ]
      },
    ]
  },
  {
    state: 'Tamil Nadu',
    cities: [
      {
        city: 'Ariyalur',
        stations: [
          { name: 'Keelapalur, Ariyalur - TNPCB', id: 'keelapalur-ariyalur-tnpcb' },
        ]
      },
      {
        city: 'Chengalpattu',
        stations: [
          { name: 'Crescent University, Chengalpattu - TNPCB', id: 'crescent-university-chengalpattu-tnpcb' },
        ]
      },
      {
        city: 'Chennai',
        stations: [
          { name: 'Alandur Bus Depot, Chennai - CPCB', id: 'alandur-bus-depot-chennai-cpcb' },
          { name: 'Arumbakkam, Chennai - TNPCB', id: 'arumbakkam-chennai-tnpcb' },
          { name: 'Gandhi Nagar_Ennore, Chennai - TNPCB', id: 'gandhi-nagar-ennore-chennai-tnpcb' },
          { name: 'Kodungaiyur, Chennai - TNPCB', id: 'kodungaiyur-chennai-tnpcb' },
          { name: 'Manali Village, Chennai - TNPCB', id: 'manali-village-chennai-tnpcb' },
          { name: 'Manali, Chennai - CPCB', id: 'manali-chennai-cpcb' },
          { name: 'Perungudi, Chennai - TNPCB', id: 'perungudi-chennai-tnpcb' },
          { name: 'Royapuram, Chennai - TNPCB', id: 'royapuram-chennai-tnpcb' },
          { name: 'Velachery Res. Area, Chennai - CPCB', id: 'velachery-res-area-chennai-cpcb' },
        ]
      },
      {
        city: 'Coimbatore',
        stations: [
          { name: 'PSG College of Arts and Science, Coimbatore - TNPCB', id: 'psg-college-of-arts-and-science-coimbatore-tnpcb' },
          { name: 'SIDCO Kurichi, Coimbatore - TNPCB', id: 'sidco-kurichi-coimbatore-tnpcb' },
        ]
      },
      {
        city: 'Cuddalore',
        stations: [
          { name: 'Kudikadu, Cuddalore - TNPCB', id: 'kudikadu-cuddalore-tnpcb' },
          { name: 'Semmandalam, Cuddalore - TNPCB', id: 'semmandalam-cuddalore-tnpcb' },
        ]
      },
      {
        city: 'Dindigul',
        stations: [
          { name: 'Mendonsa Colony, Dindigul - TNPCB', id: 'mendonsa-colony-dindigul-tnpcb' },
        ]
      },
      {
        city: 'Gummidipoondi',
        stations: [
          { name: 'Anthoni Pillai Nagar, Gummidipoondi - TNPCB', id: 'anthoni-pillai-nagar-gummidipoondi-tnpcb' },
        ]
      },
      {
        city: 'Hosur',
        stations: [
          { name: 'SIPCOT Phase-1, Hosur - TNPCB', id: 'sipcot-phase-1-hosur-tnpcb' },
        ]
      },
      {
        city: 'Kanchipuram',
        stations: [
          { name: 'Kilambi, Kanchipuram - TNPCB', id: 'kilambi-kanchipuram-tnpcb' },
        ]
      },
      {
        city: 'Karur',
        stations: [
          { name: 'Kamadenu Nagar, Karur - TNPCB', id: 'kamadenu-nagar-karur-tnpcb' },
        ]
      },
      {
        city: 'Madurai',
        stations: [
          { name: 'Uchapatti, Madurai - TNPCB', id: 'uchapatti-madurai-tnpcb' },
        ]
      },
      {
        city: 'Nagapattinam',
        stations: [
          { name: 'Velippalayam, Nagapattinam - TNPCB', id: 'velippalayam-nagapattinam-tnpcb' },
        ]
      },
      {
        city: 'Namakkal',
        stations: [
          { name: 'Ponnusamy Nagar, Namakkal - TNPCB', id: 'ponnusamy-nagar-namakkal-tnpcb' },
        ]
      },
      {
        city: 'Ooty',
        stations: [
          { name: 'Bombay Castel, Ooty - TNPCB', id: 'bombay-castel-ooty-tnpcb' },
        ]
      },
      {
        city: 'Palkalaiperur',
        stations: [
          { name: 'Bharathidasan University, Palkalaiperur - TNPCB', id: 'bharathidasan-university-palkalaiperur-tnpcb' },
        ]
      },
      {
        city: 'Perundurai',
        stations: [
          { name: 'SIPCOT Industrial Park, Perundurai - TNPCB', id: 'sipcot-industrial-park-perundurai-tnpcb' },
        ]
      },
      {
        city: 'Pudukottai',
        stations: [
          { name: 'SIPCOT Nathampannai, Pudukottai - TNPCB', id: 'sipcot-nathampannai-pudukottai-tnpcb' },
        ]
      },
      {
        city: 'Ramanathapuram',
        stations: [
          { name: 'Chalai Bazaar, Ramanathapuram - TNPCB', id: 'chalai-bazaar-ramanathapuram-tnpcb' },
        ]
      },
      {
        city: 'Ranipet',
        stations: [
          { name: 'VOC Nagar_SIPCOT, Ranipet - TNPCB', id: 'voc-nagar-sipcot-ranipet-tnpcb' },
        ]
      },
      {
        city: 'Salem',
        stations: [
          { name: 'Sona College of Technology, Salem - TNPCB', id: 'sona-college-of-technology-salem-tnpcb' },
        ]
      },
      {
        city: 'Thanjavur',
        stations: [
          { name: 'Parisutham Nagar, Thanjavur - TNPCB', id: 'parisutham-nagar-thanjavur-tnpcb' },
        ]
      },
      {
        city: 'Thoothukudi',
        stations: [
          { name: 'Meelavittan, Thoothukudi - TNPCB', id: 'meelavittan-thoothukudi-tnpcb' },
        ]
      },
      {
        city: 'Tiruchirappalli',
        stations: [
          { name: 'St Joseph College, Tiruchirappalli - TNPCB', id: 'st-joseph-college-tiruchirappalli-tnpcb' },
        ]
      },
      {
        city: 'Tirunelveli',
        stations: [
          { name: 'Municipal Corporation Office, Tirunelveli - TNPCB', id: 'municipal-corporation-office-tirunelveli-tnpcb' },
        ]
      },
      {
        city: 'Tirupur',
        stations: [
          { name: 'Kumaran College, Tirupur - TNPCB', id: 'kumaran-college-tirupur-tnpcb' },
        ]
      },
      {
        city: 'Vellore',
        stations: [
          { name: 'Vasanthapuram, Vellore - TNPCB', id: 'vasanthapuram-vellore-tnpcb' },
        ]
      },
      {
        city: 'Virudhunagar',
        stations: [
          { name: 'Collectorate Office, Virudhunagar - TNPCB', id: 'collectorate-office-virudhunagar-tnpcb' },
        ]
      },
    ]
  },
  {
    state: 'Telangana',
    cities: [
      {
        city: 'Hyderabad',
        stations: [
          { name: 'Bollaram Industrial Area, Hyderabad - TSPCB', id: 'bollaram-industrial-area-hyderabad-tspcb' },
          { name: 'Central University, Hyderabad - TSPCB', id: 'central-university-hyderabad-tspcb' },
          { name: 'ECIL Kapra, Hyderabad - TSPCB', id: 'ecil-kapra-hyderabad-tspcb' },
          { name: 'ICRISAT Patancheru, Hyderabad - TSPCB', id: 'icrisat-patancheru-hyderabad-tspcb' },
          { name: 'IDA Pashamylaram, Hyderabad - TSPCB', id: 'ida-pashamylaram-hyderabad-tspcb' },
          { name: 'IITH Kandi, Hyderabad - TSPCB', id: 'iith-kandi-hyderabad-tspcb' },
          { name: 'Kokapet, Hyderabad - TSPCB', id: 'kokapet-hyderabad-tspcb' },
          { name: 'Kompally Municipal Office, Hyderabad - TSPCB', id: 'kompally-municipal-office-hyderabad-tspcb' },
          { name: 'Nacharam_TSIIC IALA, Hyderabad - TSPCB', id: 'nacharam-tsiic-iala-hyderabad-tspcb' },
          { name: 'New Malakpet, Hyderabad - TSPCB', id: 'new-malakpet-hyderabad-tspcb' },
          { name: 'Ramachandrapuram, Hyderabad - TSPCB', id: 'ramachandrapuram-hyderabad-tspcb' },
          { name: 'Sanathnagar, Hyderabad - TSPCB', id: 'sanathnagar-hyderabad-tspcb' },
          { name: 'Somajiguda, Hyderabad - TSPCB', id: 'somajiguda-hyderabad-tspcb' },
          { name: 'Zoo Park, Hyderabad - TSPCB', id: 'zoo-park-hyderabad-tspcb' },
        ]
      },
    ]
  },
  {
    state: 'Tripura',
    cities: [
      {
        city: 'Agartala',
        stations: [
          { name: 'Bardowali, Agartala - Tripura SPCB', id: 'bardowali-agartala-tripura-spcb' },
          { name: 'Kunjaban, Agartala - Tripura SPCB', id: 'kunjaban-agartala-tripura-spcb' },
        ]
      },
    ]
  },
  {
    state: 'Uttar Pradesh',
    cities: [
      {
        city: 'Agra',
        stations: [
          { name: 'Manoharpur, Agra - UPPCB', id: 'manoharpur-agra-uppcb' },
          { name: 'Rohta, Agra - UPPCB', id: 'rohta-agra-uppcb' },
          { name: 'Sanjay Palace, Agra - UPPCB', id: 'sanjay-palace-agra-uppcb' },
          { name: 'Sector-3B Avas Vikas Colony, Agra - UPPCB', id: 'sector-3b-avas-vikas-colony-agra-uppcb' },
          { name: 'Shahjahan Garden, Agra - UPPCB', id: 'shahjahan-garden-agra-uppcb' },
          { name: 'Shastripuram, Agra - UPPCB', id: 'shastripuram-agra-uppcb' },
        ]
      },
      {
        city: 'Baghpat',
        stations: [
          { name: 'New Collectorate, Baghpat - UPPCB', id: 'new-collectorate-baghpat-uppcb' },
          { name: 'Sardar Patel Inter College, Baghpat - UPPCB', id: 'sardar-patel-inter-college-baghpat-uppcb' },
        ]
      },
      {
        city: 'Bareilly',
        stations: [
          { name: 'Civil Lines, Bareilly - UPPCB', id: 'civil-lines-bareilly-uppcb' },
          { name: 'Rajendra Nagar, Bareilly - UPPCB', id: 'rajendra-nagar-bareilly-uppcb' },
        ]
      },
      {
        city: 'Bulandshahr',
        stations: [
          { name: 'Yamunapuram, Bulandshahr - UPPCB', id: 'yamunapuram-bulandshahr-uppcb' },
        ]
      },
      {
        city: 'Firozabad',
        stations: [
          { name: 'Nagla Bhau, Firozabad - UPPCB', id: 'nagla-bhau-firozabad-uppcb' },
          { name: 'Vibhab Nagar, Firozabad - UPPCB', id: 'vibhab-nagar-firozabad-uppcb' },
        ]
      },
      {
        city: 'Ghaziabad',
        stations: [
          { name: 'Indirapuram, Ghaziabad - UPPCB', id: 'indirapuram-ghaziabad-uppcb' },
          { name: 'Loni, Ghaziabad - UPPCB', id: 'loni-ghaziabad-uppcb' },
          { name: 'Sanjay Nagar, Ghaziabad - UPPCB', id: 'sanjay-nagar-ghaziabad-uppcb' },
          { name: 'Vasundhara, Ghaziabad - UPPCB', id: 'vasundhara-ghaziabad-uppcb' },
          { name: 'Ved Vihar-Loni, Ghaziabad - UPPCB', id: 'ved-vihar-loni-ghaziabad-uppcb' },
        ]
      },
      {
        city: 'Gorakhpur',
        stations: [
          { name: 'Madan Mohan Malaviya University of Technology, Gorakhpur - UPPCB', id: 'madan-mohan-malaviya-university-of-technology-gorakhpur-uppcb' },
        ]
      },
      {
        city: 'Greater Noida',
        stations: [
          { name: 'Knowledge Park - III, Greater Noida - UPPCB', id: 'knowledge-park-iii-greater-noida-uppcb' },
          { name: 'Knowledge Park - V, Greater Noida - UPPCB', id: 'knowledge-park-v-greater-noida-uppcb' },
        ]
      },
      {
        city: 'Hapur',
        stations: [
          { name: 'Anand Vihar, Hapur - UPPCB', id: 'anand-vihar-hapur-uppcb' },
        ]
      },
      {
        city: 'Jhansi',
        stations: [
          { name: 'Shivaji Nagar, Jhansi - UPPCB', id: 'shivaji-nagar-jhansi-uppcb' },
        ]
      },
      {
        city: 'Kanpur',
        stations: [
          { name: 'FTI Kidwai Nagar, Kanpur - UPPCB', id: 'fti-kidwai-nagar-kanpur-uppcb' },
          { name: 'IITK, Kanpur - IITK', id: 'iitk-kanpur-iitk' },
          { name: 'NSI Kalyanpur, Kanpur - UPPCB', id: 'nsi-kalyanpur-kanpur-uppcb' },
          { name: 'Nehru Nagar, Kanpur - UPPCB', id: 'nehru-nagar-kanpur-uppcb' },
        ]
      },
      {
        city: 'Khora',
        stations: [
          { name: 'Prashant Garden, Khora - UPPCB', id: 'prashant-garden-khora-uppcb' },
        ]
      },
      {
        city: 'Khurja',
        stations: [
          { name: 'Kalindi Kunj, Khurja - UPPCB', id: 'kalindi-kunj-khurja-uppcb' },
        ]
      },
      {
        city: 'Lucknow',
        stations: [
          { name: 'B R Ambedkar University, Lucknow - UPPCB', id: 'b-r-ambedkar-university-lucknow-uppcb' },
          { name: 'Gomti Nagar, Lucknow - UPPCB', id: 'gomti-nagar-lucknow-uppcb' },
          { name: 'Kendriya Vidyalaya, Lucknow - CPCB', id: 'kendriya-vidyalaya-lucknow-cpcb' },
          { name: 'Kukrail Picnic Spot-1, Lucknow - UPPCB', id: 'kukrail-picnic-spot-1-lucknow-uppcb' },
          { name: 'Lalbagh, Lucknow - CPCB', id: 'lalbagh-lucknow-cpcb' },
          { name: 'Talkatora District Industries Center, Lucknow - CPCB', id: 'talkatora-district-industries-center-lucknow-cpcb' },
        ]
      },
      {
        city: 'Meerut',
        stations: [
          { name: 'Ganga Nagar, Meerut - UPPCB', id: 'ganga-nagar-meerut-uppcb' },
          { name: 'Jai Bhim Nagar, Meerut - UPPCB', id: 'jai-bhim-nagar-meerut-uppcb' },
          { name: 'Pallavpuram Phase 2, Meerut - UPPCB', id: 'pallavpuram-phase-2-meerut-uppcb' },
        ]
      },
      {
        city: 'Modinagar',
        stations: [
          { name: 'SRM University, Modinagar - UPPCB', id: 'srm-university-modinagar-uppcb' },
        ]
      },
      {
        city: 'Moradabad',
        stations: [
          { name: 'Buddhi Vihar, Moradabad - UPPCB', id: 'buddhi-vihar-moradabad-uppcb' },
          { name: 'Eco Herbal Park, Moradabad - UPPCB', id: 'eco-herbal-park-moradabad-uppcb' },
          { name: 'Employment Office, Moradabad - UPPCB', id: 'employment-office-moradabad-uppcb' },
          { name: 'Jigar Colony, Moradabad - UPPCB', id: 'jigar-colony-moradabad-uppcb' },
          { name: 'Kashiram Nagar, Moradabad - UPPCB', id: 'kashiram-nagar-moradabad-uppcb' },
          { name: 'Lajpat Nagar, Moradabad - UPPCB', id: 'lajpat-nagar-moradabad-uppcb' },
          { name: 'Transport Nagar, Moradabad - UPPCB', id: 'transport-nagar-moradabad-uppcb' },
        ]
      },
      {
        city: 'Muzaffarnagar',
        stations: [
          { name: 'New Mandi, Muzaffarnagar - UPPCB', id: 'new-mandi-muzaffarnagar-uppcb' },
        ]
      },
      {
        city: 'Noida',
        stations: [
          { name: 'Sector - 125, Noida - UPPCB', id: 'sector-125-noida-uppcb' },
          { name: 'Sector - 62, Noida - IMD', id: 'sector-62-noida-imd' },
          { name: 'Sector-1, Noida - UPPCB', id: 'sector-1-noida-uppcb' },
          { name: 'Sector-116, Noida - UPPCB', id: 'sector-116-noida-uppcb' },
        ]
      },
      {
        city: 'Prayagraj',
        stations: [
          { name: 'Jhunsi, Prayagraj - UPPCB', id: 'jhunsi-prayagraj-uppcb' },
          { name: 'Motilal Nehru NIT, Prayagraj - UPPCB', id: 'motilal-nehru-nit-prayagraj-uppcb' },
          { name: 'Nagar Nigam, Prayagraj - UPPCB', id: 'nagar-nigam-prayagraj-uppcb' },
        ]
      },
      {
        city: 'Raebareli',
        stations: [
          { name: 'Indira Nagar, Raebareli - NTPC Unchahar', id: 'indira-nagar-raebareli-ntpc-unchahar' },
        ]
      },
      {
        city: 'Varanasi',
        stations: [
          { name: 'Ardhali Bazar, Varanasi - UPPCB', id: 'ardhali-bazar-varanasi-uppcb' },
          { name: 'Bhelupur, Varanasi - UPPCB', id: 'bhelupur-varanasi-uppcb' },
          { name: 'IESD Banaras Hindu University, Varanasi - UPPCB', id: 'iesd-banaras-hindu-university-varanasi-uppcb' },
          { name: 'Maldahiya, Varanasi - UPPCB', id: 'maldahiya-varanasi-uppcb' },
        ]
      },
      {
        city: 'Vrindavan',
        stations: [
          { name: 'Omex Eternity, Vrindavan - UPPCB', id: 'omex-eternity-vrindavan-uppcb' },
        ]
      },
    ]
  },
  {
    state: 'Uttarakhand',
    cities: [
      {
        city: 'Dehradun',
        stations: [
          { name: 'Doon University, Dehradun - UKPCB', id: 'doon-university-dehradun-ukpcb' },
        ]
      },
      {
        city: 'Kashipur',
        stations: [
          { name: 'Govt. Girls Inter College, Kashipur - UKPCB', id: 'govt-girls-inter-college-kashipur-ukpcb' },
        ]
      },
      {
        city: 'Rishikesh',
        stations: [
          { name: 'Shivaji Nagar, Rishikesh - UKPCB', id: 'shivaji-nagar-rishikesh-ukpcb' },
        ]
      },
    ]
  },
  {
    state: 'West Bengal',
    cities: [
      {
        city: 'Asansol',
        stations: [
          { name: 'Asansol Court Area, Asansol - WBPCB', id: 'asansol-court-area-asansol-wbpcb' },
          { name: 'Evelyn Lodge, Asansol - WBPCB', id: 'evelyn-lodge-asansol-wbpcb' },
          { name: 'Mahabir Colliery, Asansol - WBPCB', id: 'mahabir-colliery-asansol-wbpcb' },
          { name: 'Trivenidevi Bhalotia College, Asansol - WBPCB', id: 'trivenidevi-bhalotia-college-asansol-wbpcb' },
        ]
      },
      {
        city: 'Barrackpore',
        stations: [
          { name: 'SVSPA Campus, Barrackpore - WBPCB', id: 'svspa-campus-barrackpore-wbpcb' },
        ]
      },
      {
        city: 'Durgapur',
        stations: [
          { name: 'Mahishkapur Road_B-Zone, Durgapur - WBPCB', id: 'mahishkapur-road-b-zone-durgapur-wbpcb' },
          { name: 'PCBL Residential Complex, Durgapur - WBPCB', id: 'pcbl-residential-complex-durgapur-wbpcb' },
          { name: 'Womens College_City Center, Durgapur - WBPCB', id: 'womens-college-city-center-durgapur-wbpcb' },
        ]
      },
      {
        city: 'Haldia',
        stations: [
          { name: 'Priyambada Housing Estate, Haldia - WBPCB', id: 'priyambada-housing-estate-haldia-wbpcb' },
        ]
      },
      {
        city: 'Howrah',
        stations: [
          { name: 'Belur Math, Howrah - WBPCB', id: 'belur-math-howrah-wbpcb' },
          { name: 'Botanical Garden, Howrah - WBPCB', id: 'botanical-garden-howrah-wbpcb' },
          { name: 'Dasnagar, Howrah - WBPCB', id: 'dasnagar-howrah-wbpcb' },
          { name: 'Ghusuri, Howrah - WBPCB', id: 'ghusuri-howrah-wbpcb' },
          { name: 'Padmapukur, Howrah - WBPCB', id: 'padmapukur-howrah-wbpcb' },
        ]
      },
      {
        city: 'Kolkata',
        stations: [
          { name: 'Ballygunge, Kolkata - WBPCB', id: 'ballygunge-kolkata-wbpcb' },
          { name: 'Bidhannagar, Kolkata - WBPCB', id: 'bidhannagar-kolkata-wbpcb' },
          { name: 'Fort William, Kolkata - WBPCB', id: 'fort-william-kolkata-wbpcb' },
          { name: 'Jadavpur, Kolkata - WBPCB', id: 'jadavpur-kolkata-wbpcb' },
          { name: 'Rabindra Bharati University, Kolkata - WBPCB', id: 'rabindra-bharati-university-kolkata-wbpcb' },
          { name: 'Rabindra Sarobar, Kolkata - WBPCB', id: 'rabindra-sarobar-kolkata-wbpcb' },
          { name: 'Victoria, Kolkata - WBPCB', id: 'victoria-kolkata-wbpcb' },
        ]
      },
      {
        city: 'Siliguri',
        stations: [
          { name: 'Ward-32 Bapupara, Siliguri - WBPCB', id: 'ward-32-bapupara-siliguri-wbpcb' },
        ]
      },
    ]
  },
];
