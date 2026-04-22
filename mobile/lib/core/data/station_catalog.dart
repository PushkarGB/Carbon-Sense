/// Auto-generated catalog corresponding to CPCB stations.
class StationEntry {
  const StationEntry(this.name, this.id);
  final String name;
  final String id;
  
  Map<String, dynamic> toJson() => {'name': name, 'id': id};
  factory StationEntry.fromJson(Map<String, dynamic> json) => StationEntry(json['name'], json['id']);
}

class CityEntry {
  const CityEntry(this.city, this.stations);
  final String city;
  final List<StationEntry> stations;

  Map<String, dynamic> toJson() => {'city': city, 'stations': stations.map((s) => s.toJson()).toList()};
  factory CityEntry.fromJson(Map<String, dynamic> json) => CityEntry(
    json['city'],
    (json['stations'] as List).map((s) => StationEntry.fromJson(s)).toList(),
  );
}

class StateEntry {
  const StateEntry(this.state, this.cities);
  final String state;
  final List<CityEntry> cities;

  Map<String, dynamic> toJson() => {'state': state, 'cities': cities.map((c) => c.toJson()).toList()};
  factory StateEntry.fromJson(Map<String, dynamic> json) => StateEntry(
    json['state'],
    (json['cities'] as List).map((c) => CityEntry.fromJson(c)).toList(),
  );
}

const stationCatalog = <StateEntry>[
  StateEntry('Andaman and Nicobar', [
    CityEntry('Sri Vijaya Puram', [
      StationEntry('Police Line, Sri Vijaya Puram - ANPCC', 'police-line-sri-vijaya-puram-anpcc'),
    ]),
  ]),
  StateEntry('Andhra Pradesh', [
    CityEntry('Amaravati', [
      StationEntry('Secretariat, Amaravati - APPCB', 'secretariat-amaravati-appcb'),
    ]),
    CityEntry('Anantapur', [
      StationEntry('Gulzarpet, Anantapur - APPCB', 'gulzarpet-anantapur-appcb'),
    ]),
    CityEntry('Chittoor', [
      StationEntry('Gangineni Cheruvu, Chittoor - APPCB', 'gangineni-cheruvu-chittoor-appcb'),
    ]),
    CityEntry('Eluru', [
      StationEntry('District Court, Eluru - APPCB', 'district-court-eluru-appcb'),
    ]),
    CityEntry('Guntur', [
      StationEntry('Rajendra Nagar North, Guntur - APPCB', 'rajendra-nagar-north-guntur-appcb'),
    ]),
    CityEntry('Kadapa', [
      StationEntry('Yerramukkapalli, Kadapa - APPCB', 'yerramukkapalli-kadapa-appcb'),
    ]),
    CityEntry('Machilipatnam', [
      StationEntry('Srinivas Nagar Colony, Machilipatnam - APPCB', 'srinivas-nagar-colony-machilipatnam-appcb'),
    ]),
    CityEntry('Nellore', [
      StationEntry('Ambedkar Nagar, Nellore - APPCB', 'ambedkar-nagar-nellore-appcb'),
    ]),
    CityEntry('Rajamahendravaram', [
      StationEntry('Anand Kala Kshetram, Rajamahendravaram - APPCB', 'anand-kala-kshetram-rajamahendravaram-appcb'),
    ]),
    CityEntry('Tirumala', [
      StationEntry('Toll Gate, Tirumala - APPCB', 'toll-gate-tirumala-appcb'),
    ]),
    CityEntry('Tirupati', [
      StationEntry('Vaikuntapuram, Tirupati - APPCB', 'vaikuntapuram-tirupati-appcb'),
    ]),
    CityEntry('Vijayawada', [
      StationEntry('HB Colony, Vijayawada - APPCB', 'hb-colony-vijayawada-appcb'),
      StationEntry('Kanuru, Vijayawada - APPCB', 'kanuru-vijayawada-appcb'),
      StationEntry('Rajiv Gandhi Park, Vijayawada - APPCB', 'rajiv-gandhi-park-vijayawada-appcb'),
      StationEntry('Rajiv Nagar, Vijayawada - APPCB', 'rajiv-nagar-vijayawada-appcb'),
    ]),
    CityEntry('Visakhapatnam', [
      StationEntry('GVM Corporation, Visakhapatnam - APPCB', 'gvm-corporation-visakhapatnam-appcb'),
    ]),
  ]),
  StateEntry('Arunachal Pradesh', [
    CityEntry('Naharlagun', [
      StationEntry('Naharlagun, Naharlagun - APSPCB', 'naharlagun-naharlagun-apspcb'),
    ]),
  ]),
  StateEntry('Assam', [
    CityEntry('Byrnihat', [
      StationEntry('Central Academy for SFS, Byrnihat - PCBA', 'central-academy-for-sfs-byrnihat-pcba'),
    ]),
    CityEntry('Guwahati', [
      StationEntry('IITG, Guwahati - PCBA', 'iitg-guwahati-pcba'),
      StationEntry('LGBI Airport, Guwahati - PCBA', 'lgbi-airport-guwahati-pcba'),
      StationEntry('Pan Bazaar, Guwahati - PCBA', 'pan-bazaar-guwahati-pcba'),
      StationEntry('Railway Colony, Guwahati - PCBA', 'railway-colony-guwahati-pcba'),
    ]),
    CityEntry('Nagaon', [
      StationEntry('Christianpatty, Nagaon - PCBA', 'christianpatty-nagaon-pcba'),
    ]),
    CityEntry('Nalbari', [
      StationEntry('Bata Chowk, Nalbari - PCBA', 'bata-chowk-nalbari-pcba'),
    ]),
    CityEntry('Silchar', [
      StationEntry('Tarapur, Silchar - PCBA', 'tarapur-silchar-pcba'),
    ]),
    CityEntry('Sivasagar', [
      StationEntry('Girls College, Sivasagar - PCBA', 'girls-college-sivasagar-pcba'),
    ]),
  ]),
  StateEntry('Bihar', [
    CityEntry('Araria', [
      StationEntry('Kharahiya Basti, Araria - BSPCB', 'kharahiya-basti-araria-bspcb'),
    ]),
    CityEntry('Arrah', [
      StationEntry('New DM Office, Arrah - BSPCB', 'new-dm-office-arrah-bspcb'),
    ]),
    CityEntry('Aurangabad', [
      StationEntry('Gurdeo Nagar, Aurangabad - BSPCB', 'gurdeo-nagar-aurangabad-bspcb'),
    ]),
    CityEntry('Begusarai', [
      StationEntry('Lohiyanagar, Begusarai - BSPCB', 'lohiyanagar-begusarai-bspcb'),
    ]),
    CityEntry('Bettiah', [
      StationEntry('Kamalnath Nagar, Bettiah - BSPCB', 'kamalnath-nagar-bettiah-bspcb'),
    ]),
    CityEntry('Bhagalpur', [
      StationEntry('DM Office_Kachari Chowk, Bhagalpur - BSPCB', 'dm-office-kachari-chowk-bhagalpur-bspcb'),
      StationEntry('Mayaganj, Bhagalpur - BSPCB', 'mayaganj-bhagalpur-bspcb'),
    ]),
    CityEntry('Bihar Sharif', [
      StationEntry('D M Colony, Bihar Sharif - BSPCB', 'd-m-colony-bihar-sharif-bspcb'),
    ]),
    CityEntry('Buxar', [
      StationEntry('Charitra Van, Buxar - BSPCB', 'charitra-van-buxar-bspcb'),
    ]),
    CityEntry('Chhapra', [
      StationEntry('Darshan Nagar, Chhapra - BSPCB', 'darshan-nagar-chhapra-bspcb'),
    ]),
    CityEntry('Darbhanga', [
      StationEntry('Town Hall - Lal Bagh, Darbhanga - BSPCB', 'town-hall-lal-bagh-darbhanga-bspcb'),
    ]),
    CityEntry('Gaya', [
      StationEntry('Collectorate, Gaya - BSPCB', 'collectorate-gaya-bspcb'),
      StationEntry('Kareemganj, Gaya - BSPCB', 'kareemganj-gaya-bspcb'),
      StationEntry('SFTI Kusdihra, Gaya - BSPCB', 'sfti-kusdihra-gaya-bspcb'),
    ]),
    CityEntry('Hajipur', [
      StationEntry('Industrial Area, Hajipur - BSPCB', 'industrial-area-hajipur-bspcb'),
    ]),
    CityEntry('Katihar', [
      StationEntry('Mirchaibari, Katihar - BSPCB', 'mirchaibari-katihar-bspcb'),
    ]),
    CityEntry('Kishanganj', [
      StationEntry('SDM Office_Khagra, Kishanganj - BSPCB', 'sdm-office-khagra-kishanganj-bspcb'),
    ]),
    CityEntry('Manguraha', [
      StationEntry('Forest Rest House, Manguraha - BSPCB', 'forest-rest-house-manguraha-bspcb'),
    ]),
    CityEntry('Motihari', [
      StationEntry('Gandak Colony, Motihari - BSPCB', 'gandak-colony-motihari-bspcb'),
    ]),
    CityEntry('Munger', [
      StationEntry('Town Hall, Munger - BSPCB', 'town-hall-munger-bspcb'),
    ]),
    CityEntry('Muzaffarpur', [
      StationEntry('Buddha Colony, Muzaffarpur - BSPCB', 'buddha-colony-muzaffarpur-bspcb'),
      StationEntry('MIT-Daudpur Kothi, Muzaffarpur - BSPCB', 'mit-daudpur-kothi-muzaffarpur-bspcb'),
      StationEntry('Muzaffarpur Collectorate, Muzaffarpur - BSPCB', 'muzaffarpur-collectorate-muzaffarpur-bspcb'),
    ]),
    CityEntry('Patna', [
      StationEntry('DRM Office Danapur, Patna - BSPCB', 'drm-office-danapur-patna-bspcb'),
      StationEntry('Govt. High School Shikarpur, Patna - BSPCB', 'govt-high-school-shikarpur-patna-bspcb'),
      StationEntry('IGSC Planetarium Complex, Patna - BSPCB', 'igsc-planetarium-complex-patna-bspcb'),
      StationEntry('Muradpur, Patna - BSPCB', 'muradpur-patna-bspcb'),
      StationEntry('Rajbansi Nagar, Patna - BSPCB', 'rajbansi-nagar-patna-bspcb'),
      StationEntry('Samanpura, Patna - BSPCB', 'samanpura-patna-bspcb'),
    ]),
    CityEntry('Purnia', [
      StationEntry('Mariam Nagar, Purnia - BSPCB', 'mariam-nagar-purnia-bspcb'),
    ]),
    CityEntry('Rajgir', [
      StationEntry('Dangi Tola, Rajgir - BSPCB', 'dangi-tola-rajgir-bspcb'),
    ]),
    CityEntry('Saharsa', [
      StationEntry('Police Line, Saharsa - BSPCB', 'police-line-saharsa-bspcb'),
    ]),
    CityEntry('Samastipur', [
      StationEntry('DM Office_Kasipur, Samastipur - BSPCB', 'dm-office-kasipur-samastipur-bspcb'),
    ]),
    CityEntry('Sasaram', [
      StationEntry('Dada Peer, Sasaram - BSPCB', 'dada-peer-sasaram-bspcb'),
    ]),
    CityEntry('Siwan', [
      StationEntry('Chitragupta Nagar, Siwan - BSPCB', 'chitragupta-nagar-siwan-bspcb'),
    ]),
  ]),
  StateEntry('Chandigarh', [
    CityEntry('Chandigarh', [
      StationEntry('Sector 22, Chandigarh - CPCC', 'sector-22-chandigarh-cpcc'),
      StationEntry('Sector-25, Chandigarh - CPCC', 'sector-25-chandigarh-cpcc'),
      StationEntry('Sector-53, Chandigarh - CPCC', 'sector-53-chandigarh-cpcc'),
    ]),
  ]),
  StateEntry('Chhattisgarh', [
    CityEntry('Bhilai', [
      StationEntry('32Bungalows, Bhilai - CECB', '32bungalows-bhilai-cecb'),
      StationEntry('Civic Center, Bhilai - Bhilai Steel Plant', 'civic-center-bhilai-bhilai-steel-plant'),
      StationEntry('Hathkhoj, Bhilai - CECB', 'hathkhoj-bhilai-cecb'),
    ]),
    CityEntry('Bilaspur', [
      StationEntry('Mangala, Bilaspur - NTPC', 'mangala-bilaspur-ntpc'),
    ]),
    CityEntry('Chhal', [
      StationEntry('Nawapara SECL Colony, Chhal - CECB', 'nawapara-secl-colony-chhal-cecb'),
    ]),
    CityEntry('Korba', [
      StationEntry('Rampur, Korba - CECB', 'rampur-korba-cecb'),
      StationEntry('Urja Nagar, Korba - CECB', 'urja-nagar-korba-cecb'),
    ]),
    CityEntry('Kunjemura', [
      StationEntry('OP Jindal School, Kunjemura - CECB', 'op-jindal-school-kunjemura-cecb'),
    ]),
    CityEntry('Milupara', [
      StationEntry('Govt. Higher Secondary School, Milupara - CECB', 'govt-higher-secondary-school-milupara-cecb'),
    ]),
    CityEntry('Raipur', [
      StationEntry('AIIMS, Raipur - CECB', 'aiims-raipur-cecb'),
      StationEntry('Bhatagaon New ISBT, Raipur - CECB', 'bhatagaon-new-isbt-raipur-cecb'),
      StationEntry('Krishak Nagar, Raipur - CECB', 'krishak-nagar-raipur-cecb'),
      StationEntry('Siltara Phase-II, Raipur - CECB', 'siltara-phase-ii-raipur-cecb'),
    ]),
    CityEntry('Tumidih', [
      StationEntry('OP Jindal Industrial Park, Tumidih - CECB', 'op-jindal-industrial-park-tumidih-cecb'),
    ]),
  ]),
  StateEntry('Delhi', [
    CityEntry('Delhi', [
      StationEntry('Alipur, Delhi - DPCC', 'alipur-delhi-dpcc'),
      StationEntry('Anand Vihar, Delhi - DPCC', 'anand-vihar-delhi-dpcc'),
      StationEntry('Ashok Vihar, Delhi - DPCC', 'ashok-vihar-delhi-dpcc'),
      StationEntry('Aya Nagar, Delhi - IMD', 'aya-nagar-delhi-imd'),
      StationEntry('Bawana, Delhi - DPCC', 'bawana-delhi-dpcc'),
      StationEntry('Burari Crossing, Delhi - IMD', 'burari-crossing-delhi-imd'),
      StationEntry('CRRI Mathura Road, Delhi - IMD', 'crri-mathura-road-delhi-imd'),
      StationEntry('Cantonment Area, Delhi - DPCC', 'cantonment-area-delhi-dpcc'),
      StationEntry('Chandni Chowk, Delhi - IITM', 'chandni-chowk-delhi-iitm'),
      StationEntry('Commonwealth Sports Complex, Delhi - DPCC', 'commonwealth-sports-complex-delhi-dpcc'),
      StationEntry('DTU, Delhi - CPCB', 'dtu-delhi-cpcb'),
      StationEntry('Dr. Karni Singh Shooting Range, Delhi - DPCC', 'dr-karni-singh-shooting-range-delhi-dpcc'),
      StationEntry('Dwarka-Sector 8, Delhi - DPCC', 'dwarka-sector-8-delhi-dpcc'),
      StationEntry('IGI Airport (T3), Delhi - IMD', 'igi-airport-t3-delhi-imd'),
      StationEntry('IGNOU_Maidan Garhi, Delhi - DPCC', 'ignou-maidan-garhi-delhi-dpcc'),
      StationEntry('IHBAS, Dilshad Garden, Delhi - CPCB', 'ihbas-dilshad-garden-delhi-cpcb'),
      StationEntry('IIT Delhi, Delhi - IITM', 'iit-delhi-delhi-iitm'),
      StationEntry('ITO, Delhi - CPCB', 'ito-delhi-cpcb'),
      StationEntry('JNU, Delhi - DPCC', 'jnu-delhi-dpcc'),
      StationEntry('Jahangirpuri, Delhi - DPCC', 'jahangirpuri-delhi-dpcc'),
      StationEntry('Jawaharlal Nehru Stadium, Delhi - DPCC', 'jawaharlal-nehru-stadium-delhi-dpcc'),
      StationEntry('Lodhi Road, Delhi - IITM', 'lodhi-road-delhi-iitm'),
      StationEntry('Lodhi Road, Delhi - IMD', 'lodhi-road-delhi-imd'),
      StationEntry('Major Dhyan Chand National Stadium, Delhi - DPCC', 'major-dhyan-chand-national-stadium-delhi-dpcc'),
      StationEntry('Mandir Marg, Delhi - DPCC', 'mandir-marg-delhi-dpcc'),
      StationEntry('Mundka, Delhi - DPCC', 'mundka-delhi-dpcc'),
      StationEntry('NSIT Dwarka, Delhi - CPCB', 'nsit-dwarka-delhi-cpcb'),
      StationEntry('NSUT Jaffarpur, Delhi - DPCC', 'nsut-jaffarpur-delhi-dpcc'),
      StationEntry('Najafgarh, Delhi - DPCC', 'najafgarh-delhi-dpcc'),
      StationEntry('Narela, Delhi - DPCC', 'narela-delhi-dpcc'),
      StationEntry('Nehru Nagar, Delhi - DPCC', 'nehru-nagar-delhi-dpcc'),
      StationEntry('New Moti Bagh, Delhi - MHUA', 'new-moti-bagh-delhi-mhua'),
      StationEntry('North Campus, DU, Delhi - IMD', 'north-campus-du-delhi-imd'),
      StationEntry('Okhla Phase-2, Delhi - DPCC', 'okhla-phase-2-delhi-dpcc'),
      StationEntry('Patparganj, Delhi - DPCC', 'patparganj-delhi-dpcc'),
      StationEntry('Punjabi Bagh, Delhi - DPCC', 'punjabi-bagh-delhi-dpcc'),
      StationEntry('Pusa, Delhi - DPCC', 'pusa-delhi-dpcc'),
      StationEntry('Pusa, Delhi - IMD', 'pusa-delhi-imd'),
      StationEntry('R K Puram, Delhi - DPCC', 'r-k-puram-delhi-dpcc'),
      StationEntry('Rohini, Delhi - DPCC', 'rohini-delhi-dpcc'),
      StationEntry('Shadipur, Delhi - CPCB', 'shadipur-delhi-cpcb'),
      StationEntry('Sirifort, Delhi - CPCB', 'sirifort-delhi-cpcb'),
      StationEntry('Sonia Vihar, Delhi - DPCC', 'sonia-vihar-delhi-dpcc'),
      StationEntry('Sri Aurobindo Marg, Delhi - DPCC', 'sri-aurobindo-marg-delhi-dpcc'),
      StationEntry('Talkatora Garden, Delhi - DPCC', 'talkatora-garden-delhi-dpcc'),
      StationEntry('Vivek Vihar, Delhi - DPCC', 'vivek-vihar-delhi-dpcc'),
      StationEntry('Wazirpur, Delhi - DPCC', 'wazirpur-delhi-dpcc'),
    ]),
  ]),
  StateEntry('Gujarat', [
    CityEntry('Ahmedabad', [
      StationEntry('Chandkheda, Ahmedabad - IITM', 'chandkheda-ahmedabad-iitm'),
      StationEntry('Gyaspur, Ahmedabad - IITM', 'gyaspur-ahmedabad-iitm'),
      StationEntry('Maninagar, Ahmedabad - GPCB', 'maninagar-ahmedabad-gpcb'),
      StationEntry('Raikhad, Ahmedabad - IITM', 'raikhad-ahmedabad-iitm'),
      StationEntry('Rakhial, Ahmedabad - IITM', 'rakhial-ahmedabad-iitm'),
      StationEntry('SAC ISRO Bopal, Ahmedabad - IITM', 'sac-isro-bopal-ahmedabad-iitm'),
      StationEntry('SAC ISRO Satellite, Ahmedabad - IITM', 'sac-isro-satellite-ahmedabad-iitm'),
      StationEntry('SVPI Airport Hansol, Ahmedabad - IITM', 'svpi-airport-hansol-ahmedabad-iitm'),
      StationEntry('Sardar Vallabhbhai Patel Stadium, Ahmedabad - IITM', 'sardar-vallabhbhai-patel-stadium-ahmedabad-iitm'),
    ]),
    CityEntry('Ankleshwar', [
      StationEntry('GIDC, Ankleshwar - GPCB', 'gidc-ankleshwar-gpcb'),
    ]),
    CityEntry('Bhavnagar', [
      StationEntry('Vidhyanagar, Bhavnagar - Nexteng Enviro', 'vidhyanagar-bhavnagar-nexteng-enviro'),
    ]),
    CityEntry('Gandhinagar', [
      StationEntry('GIFT City, Gandhinagar - IITM', 'gift-city-gandhinagar-iitm'),
      StationEntry('IIPHG Lekawada, Gandhinagar - IITM', 'iiphg-lekawada-gandhinagar-iitm'),
      StationEntry('Sector-10, Gandhinagar - GPCB', 'sector-10-gandhinagar-gpcb'),
    ]),
    CityEntry('Mehsana', [
      StationEntry('Sadanand Nagar, Mehsana - Nexteng Enviro', 'sadanand-nagar-mehsana-nexteng-enviro'),
    ]),
    CityEntry('Nandesari', [
      StationEntry('GIDC, Nandesari - Nandesari Ind. Association', 'gidc-nandesari-nandesari-ind-association'),
    ]),
    CityEntry('Rajkot', [
      StationEntry('Mavdi, Rajkot - Nexteng Enviro', 'mavdi-rajkot-nexteng-enviro'),
    ]),
    CityEntry('Surat', [
      StationEntry('Katargam, Surat - Nexteng Enviro', 'katargam-surat-nexteng-enviro'),
      StationEntry('Science Center, Surat - SMC', 'science-center-surat-smc'),
    ]),
    CityEntry('Vadodara', [
      StationEntry('Bapunagar, Vadodara - Nexteng Enviro', 'bapunagar-vadodara-nexteng-enviro'),
    ]),
    CityEntry('Vapi', [
      StationEntry('Phase-1 GIDC, Vapi - GPCB', 'phase-1-gidc-vapi-gpcb'),
    ]),
    CityEntry('Vatva', [
      StationEntry('Phase-4 GIDC, Vatva - GPCB', 'phase-4-gidc-vatva-gpcb'),
    ]),
  ]),
  StateEntry('Haryana', [
    CityEntry('Ambala', [
      StationEntry('Patti Mehar, Ambala - HSPCB', 'patti-mehar-ambala-hspcb'),
    ]),
    CityEntry('Bahadurgarh', [
      StationEntry('Arya Nagar, Bahadurgarh - HSPCB', 'arya-nagar-bahadurgarh-hspcb'),
    ]),
    CityEntry('Ballabgarh', [
      StationEntry('Nathu Colony, Ballabgarh - HSPCB', 'nathu-colony-ballabgarh-hspcb'),
    ]),
    CityEntry('Bhiwani', [
      StationEntry('H.B. Colony, Bhiwani - HSPCB', 'h-b-colony-bhiwani-hspcb'),
    ]),
    CityEntry('Charkhi Dadri', [
      StationEntry('Mini Secretariat, Charkhi Dadri - HSPCB', 'mini-secretariat-charkhi-dadri-hspcb'),
    ]),
    CityEntry('Dharuhera', [
      StationEntry('Municipal Corporation Office, Dharuhera -  HSPCB', 'municipal-corporation-office-dharuhera-hspcb'),
    ]),
    CityEntry('Faridabad', [
      StationEntry('New Industrial Town, Faridabad - HSPCB', 'new-industrial-town-faridabad-hspcb'),
      StationEntry('Sector 11, Faridabad - HSPCB', 'sector-11-faridabad-hspcb'),
      StationEntry('Sector 30, Faridabad - HSPCB', 'sector-30-faridabad-hspcb'),
      StationEntry('Sector- 16A, Faridabad - HSPCB', 'sector-16a-faridabad-hspcb'),
    ]),
    CityEntry('Fatehabad', [
      StationEntry('Huda Sector, Fatehabad - HSPCB', 'huda-sector-fatehabad-hspcb'),
    ]),
    CityEntry('Gurugram', [
      StationEntry('NISE Gwal Pahari, Gurugram - IMD', 'nise-gwal-pahari-gurugram-imd'),
      StationEntry('Sector-51, Gurugram - HSPCB', 'sector-51-gurugram-hspcb'),
      StationEntry('Teri Gram, Gurugram - HSPCB', 'teri-gram-gurugram-hspcb'),
      StationEntry('Vikas Sadan, Gurugram - HSPCB', 'vikas-sadan-gurugram-hspcb'),
    ]),
    CityEntry('Hisar', [
      StationEntry('Urban Estate-II, Hisar - HSPCB', 'urban-estate-ii-hisar-hspcb'),
    ]),
    CityEntry('Jind', [
      StationEntry('Police Lines, Jind - HSPCB', 'police-lines-jind-hspcb'),
    ]),
    CityEntry('Kaithal', [
      StationEntry('Rishi Nagar, Kaithal - HSPCB', 'rishi-nagar-kaithal-hspcb'),
    ]),
    CityEntry('Karnal', [
      StationEntry('Sector-12, Karnal - HSPCB', 'sector-12-karnal-hspcb'),
    ]),
    CityEntry('Kurukshetra', [
      StationEntry('Sector-7, Kurukshetra - HSPCB', 'sector-7-kurukshetra-hspcb'),
    ]),
    CityEntry('Mandikhera', [
      StationEntry('General Hospital, Mandikhera(Nuh) - HSPCB', 'general-hospital-mandikhera-nuh-hspcb'),
    ]),
    CityEntry('Manesar', [
      StationEntry('Sector-2 IMT, Manesar - HSPCB', 'sector-2-imt-manesar-hspcb'),
    ]),
    CityEntry('Narnaul', [
      StationEntry('Shastri Nagar, Narnaul - HSPCB', 'shastri-nagar-narnaul-hspcb'),
    ]),
    CityEntry('Palwal', [
      StationEntry('Shyam Nagar, Palwal - HSPCB', 'shyam-nagar-palwal-hspcb'),
    ]),
    CityEntry('Panchgaon', [
      StationEntry('Amity University, Panchgaon - IITM', 'amity-university-panchgaon-iitm'),
    ]),
    CityEntry('Panchkula', [
      StationEntry('Sector-6, Panchkula - HSPCB', 'sector-6-panchkula-hspcb'),
    ]),
    CityEntry('Panipat', [
      StationEntry('Sector-18, Panipat - HSPCB', 'sector-18-panipat-hspcb'),
    ]),
    CityEntry('Rohtak', [
      StationEntry('MD University, Rohtak - HSPCB', 'md-university-rohtak-hspcb'),
    ]),
    CityEntry('Sirsa', [
      StationEntry('F-Block, Sirsa - HSPCB', 'f-block-sirsa-hspcb'),
    ]),
    CityEntry('Sonipat', [
      StationEntry('Murthal, Sonipat - HSPCB', 'murthal-sonipat-hspcb'),
    ]),
    CityEntry('Yamuna Nagar', [
      StationEntry('Gobind Pura, Yamuna Nagar - HSPCB', 'gobind-pura-yamuna-nagar-hspcb'),
    ]),
  ]),
  StateEntry('Himachal Pradesh', [
    CityEntry('Baddi', [
      StationEntry('HIMUDA Complex Phase-1, Baddi - HPPCB', 'himuda-complex-phase-1-baddi-hppcb'),
    ]),
  ]),
  StateEntry('Jammu and Kashmir', [
    CityEntry('Pampore', [
      StationEntry('Khrew, Pampore - JKPCC', 'khrew-pampore-jkpcc'),
    ]),
    CityEntry('Srinagar', [
      StationEntry('Khunmoh, Srinagar - JKPCC', 'khunmoh-srinagar-jkpcc'),
      StationEntry('Rajbagh, Srinagar - JKPCC', 'rajbagh-srinagar-jkpcc'),
    ]),
  ]),
  StateEntry('Jharkhand', [
    CityEntry('Dhanbad', [
      StationEntry('Kalakusuma, Dhanbad - DMC', 'kalakusuma-dhanbad-dmc'),
      StationEntry('Sardar Patel Nagar, Dhanbad - JSPCB', 'sardar-patel-nagar-dhanbad-jspcb'),
    ]),
    CityEntry('Jorapokhar', [
      StationEntry('Tata Stadium, Jorapokhar - JSPCB', 'tata-stadium-jorapokhar-jspcb'),
    ]),
    CityEntry('Pathardih', [
      StationEntry('Mohalbani Ghat, Pathardih - DMC', 'mohalbani-ghat-pathardih-dmc'),
    ]),
  ]),
  StateEntry('Karnataka', [
    CityEntry('Bagalkot', [
      StationEntry('Vidayagiri, Bagalkot - KSPCB', 'vidayagiri-bagalkot-kspcb'),
    ]),
    CityEntry('Belgaum', [
      StationEntry('Ramteerth Nagar, Belgaum - KSPCB', 'ramteerth-nagar-belgaum-kspcb'),
    ]),
    CityEntry('Bengaluru', [
      StationEntry('BTM Layout, Bengaluru - CPCB', 'btm-layout-bengaluru-cpcb'),
      StationEntry('BWSSB Kadabesanahalli, Bengaluru - CPCB', 'bwssb-kadabesanahalli-bengaluru-cpcb'),
      StationEntry('Bapuji Nagar, Bengaluru - KSPCB', 'bapuji-nagar-bengaluru-kspcb'),
      StationEntry('City Railway Station, Bengaluru - KSPCB', 'city-railway-station-bengaluru-kspcb'),
      StationEntry('Hebbal, Bengaluru - KSPCB', 'hebbal-bengaluru-kspcb'),
      StationEntry('Hombegowda Nagar, Bengaluru - KSPCB', 'hombegowda-nagar-bengaluru-kspcb'),
      StationEntry('Jayanagar 5th Block, Bengaluru - KSPCB', 'jayanagar-5th-block-bengaluru-kspcb'),
      StationEntry('Jigani, Bengaluru - KSPCB', 'jigani-bengaluru-kspcb'),
      StationEntry('Kasturi Nagar, Bengaluru - KSPCB', 'kasturi-nagar-bengaluru-kspcb'),
      StationEntry('Peenya, Bengaluru - CPCB', 'peenya-bengaluru-cpcb'),
      StationEntry('RVCE-Mailasandra, Bengaluru - KSPCB', 'rvce-mailasandra-bengaluru-kspcb'),
      StationEntry('Sanegurava Halli, Bengaluru - KSPCB', 'sanegurava-halli-bengaluru-kspcb'),
      StationEntry('Shivapura_Peenya, Bengaluru - KSPCB', 'shivapura-peenya-bengaluru-kspcb'),
      StationEntry('Silk Board, Bengaluru - KSPCB', 'silk-board-bengaluru-kspcb'),
    ]),
    CityEntry('Bidar', [
      StationEntry('Naubad, Bidar - KSPCB', 'naubad-bidar-kspcb'),
    ]),
    CityEntry('Chamarajanagar', [
      StationEntry('Urban, Chamarajanagar - KSPCB', 'urban-chamarajanagar-kspcb'),
    ]),
    CityEntry('Chikkaballapur', [
      StationEntry('Chikkaballapur Rural, Chikkaballapur - KSPCB', 'chikkaballapur-rural-chikkaballapur-kspcb'),
    ]),
    CityEntry('Chikkamagaluru', [
      StationEntry('Kalyana Nagara, Chikkamagaluru - KSPCB', 'kalyana-nagara-chikkamagaluru-kspcb'),
    ]),
    CityEntry('Davanagere', [
      StationEntry('Devaraj Urs Badavane, Davanagere - KSPCB', 'devaraj-urs-badavane-davanagere-kspcb'),
    ]),
    CityEntry('Dharwad', [
      StationEntry('Kalabhavan, Dharwad - KSPCB', 'kalabhavan-dharwad-kspcb'),
    ]),
    CityEntry('Gadag', [
      StationEntry('Panchal Nagar, Gadag - KSPCB', 'panchal-nagar-gadag-kspcb'),
    ]),
    CityEntry('Hassan', [
      StationEntry('B.Katihalli, Hassan - KSPCB', 'b-katihalli-hassan-kspcb'),
    ]),
    CityEntry('Haveri', [
      StationEntry('Ashwini Nagar, Haveri - KSPCB', 'ashwini-nagar-haveri-kspcb'),
    ]),
    CityEntry('Hubballi', [
      StationEntry('Deshpande Nagar, Hubballi - KSPCB', 'deshpande-nagar-hubballi-kspcb'),
      StationEntry('Lingaraj Nagar, Hubballi - KSPCB', 'lingaraj-nagar-hubballi-kspcb'),
    ]),
    CityEntry('Kalaburagi', [
      StationEntry('Lal Bahadur Shastri Nagar, Kalaburagi - KSPCB', 'lal-bahadur-shastri-nagar-kalaburagi-kspcb'),
      StationEntry('Mahatma Basaveswar Colony, Kalaburgi - KSPCB', 'mahatma-basaveswar-colony-kalaburgi-kspcb'),
    ]),
    CityEntry('Karwar', [
      StationEntry('KHB Colony, Karwar - KSPCB', 'khb-colony-karwar-kspcb'),
    ]),
    CityEntry('Kolar', [
      StationEntry('Tamaka Ind. Area, Kolar - KSPCB', 'tamaka-ind-area-kolar-kspcb'),
    ]),
    CityEntry('Koppal', [
      StationEntry('Diwator Nagar, Koppal - KSPCB', 'diwator-nagar-koppal-kspcb'),
    ]),
    CityEntry('Madikeri', [
      StationEntry('Stuart Hill, Madikeri - KSPCB', 'stuart-hill-madikeri-kspcb'),
    ]),
    CityEntry('Mangalore', [
      StationEntry('Kadri, Mangalore - KSPCB', 'kadri-mangalore-kspcb'),
    ]),
    CityEntry('Mysuru', [
      StationEntry('Hebbal 1st Stage, Mysuru - KSPCB', 'hebbal-1st-stage-mysuru-kspcb'),
    ]),
    CityEntry('Raichur', [
      StationEntry('Haji Colony, Raichur - KSPCB', 'haji-colony-raichur-kspcb'),
    ]),
    CityEntry('Ramanagara', [
      StationEntry('Vijay Nagar, Ramanagara - KSPCB', 'vijay-nagar-ramanagara-kspcb'),
    ]),
    CityEntry('Shivamogga', [
      StationEntry('Vinoba Nagara, Shivamogga - KSPCB', 'vinoba-nagara-shivamogga-kspcb'),
    ]),
    CityEntry('Tumakuru', [
      StationEntry('Thimmalapura, Tumakuru - KSPCB', 'thimmalapura-tumakuru-kspcb'),
    ]),
    CityEntry('Udupi', [
      StationEntry('Brahmagiri, Udupi - KSPCB', 'brahmagiri-udupi-kspcb'),
    ]),
    CityEntry('Vijayapura', [
      StationEntry('Ibrahimpur, Vijayapura - KSPCB', 'ibrahimpur-vijayapura-kspcb'),
    ]),
    CityEntry('Yadgir', [
      StationEntry('Collector Office, Yadgir - KSPCB', 'collector-office-yadgir-kspcb'),
    ]),
  ]),
  StateEntry('Kerala', [
    CityEntry('Eloor', [
      StationEntry('Udyogamandal, Eloor - Kerala PCB', 'udyogamandal-eloor-kerala-pcb'),
    ]),
    CityEntry('Ernakulam', [
      StationEntry('Kacheripady, Ernakulam - Kerala PCB', 'kacheripady-ernakulam-kerala-pcb'),
    ]),
    CityEntry('Kannur', [
      StationEntry('Thavakkara, Kannur - Kerala PCB', 'thavakkara-kannur-kerala-pcb'),
    ]),
    CityEntry('Kochi', [
      StationEntry('Vyttila, Kochi - Kerala PCB', 'vyttila-kochi-kerala-pcb'),
    ]),
    CityEntry('Kollam', [
      StationEntry('Polayathode, Kollam - Kerala PCB', 'polayathode-kollam-kerala-pcb'),
    ]),
    CityEntry('Kozhikode', [
      StationEntry('Palayam, Kozhikode - Kerala PCB', 'palayam-kozhikode-kerala-pcb'),
    ]),
    CityEntry('Thiruvananthapuram', [
      StationEntry('Kariavattom, Thiruvananthapuram - Kerala PCB', 'kariavattom-thiruvananthapuram-kerala-pcb'),
      StationEntry('Plammoodu, Thiruvananthapuram - Kerala PCB', 'plammoodu-thiruvananthapuram-kerala-pcb'),
    ]),
    CityEntry('Thrissur', [
      StationEntry('Corporation Ground, Thrissur - Kerala PCB', 'corporation-ground-thrissur-kerala-pcb'),
    ]),
  ]),
  StateEntry('Madhya Pradesh', [
    CityEntry('Bhopal', [
      StationEntry('Idgah Hills, Bhopal - MPPCB', 'idgah-hills-bhopal-mppcb'),
      StationEntry('Paryavaran Parisar, Bhopal - MPPCB', 'paryavaran-parisar-bhopal-mppcb'),
      StationEntry('T T Nagar, Bhopal - MPPCB', 't-t-nagar-bhopal-mppcb'),
    ]),
    CityEntry('Damoh', [
      StationEntry('Shrivastav Colony, Damoh - MPPCB', 'shrivastav-colony-damoh-mppcb'),
    ]),
    CityEntry('Dewas', [
      StationEntry('Bhopal Chauraha, Dewas - MPPCB', 'bhopal-chauraha-dewas-mppcb'),
    ]),
    CityEntry('Gwalior', [
      StationEntry('City Center, Gwalior - MPPCB', 'city-center-gwalior-mppcb'),
      StationEntry('Deen Dayal Nagar, Gwalior - MPPCB', 'deen-dayal-nagar-gwalior-mppcb'),
      StationEntry('Maharaj Bada, Gwalior - MPPCB', 'maharaj-bada-gwalior-mppcb'),
      StationEntry('Phool Bagh, Gwalior - Mondelez Ind. Food', 'phool-bagh-gwalior-mondelez-ind-food'),
    ]),
    CityEntry('Indore', [
      StationEntry('Airport Area, Indore - IMC', 'airport-area-indore-imc'),
      StationEntry('Chhoti Gwaltoli, Indore - MPPCB', 'chhoti-gwaltoli-indore-mppcb'),
      StationEntry('Maguda Nagar, Indore - IMC', 'maguda-nagar-indore-imc'),
      StationEntry('Regional Park, Indore - IMC', 'regional-park-indore-imc'),
      StationEntry('Residency Area, Indore - IMC', 'residency-area-indore-imc'),
      StationEntry('Vijay Nagar Scheme-78, Indore - Glenmark', 'vijay-nagar-scheme-78-indore-glenmark'),
    ]),
    CityEntry('Jabalpur', [
      StationEntry('Govindh Bhavan Colony, Jabalpur - JMC', 'govindh-bhavan-colony-jabalpur-jmc'),
      StationEntry('Gupteshwar, Jabalpur - JMC', 'gupteshwar-jabalpur-jmc'),
      StationEntry('Marhatal, Jabalpur - MPPCB', 'marhatal-jabalpur-mppcb'),
      StationEntry('Suhagi, Jabalpur - JMC', 'suhagi-jabalpur-jmc'),
    ]),
    CityEntry('Katni', [
      StationEntry('Gole Bazar, Katni - MPPCB', 'gole-bazar-katni-mppcb'),
    ]),
    CityEntry('Maihar', [
      StationEntry('Sahilara, Maihar - KJS Cements', 'sahilara-maihar-kjs-cements'),
    ]),
    CityEntry('Mandideep', [
      StationEntry('Sector-D Industrial Area, Mandideep - MPPCB', 'sector-d-industrial-area-mandideep-mppcb'),
    ]),
    CityEntry('Pithampur', [
      StationEntry('Sector-2 Industrial Area, Pithampur - MPPCB', 'sector-2-industrial-area-pithampur-mppcb'),
    ]),
    CityEntry('Ratlam', [
      StationEntry('Shasthri Nagar, Ratlam - IPCA Lab', 'shasthri-nagar-ratlam-ipca-lab'),
    ]),
    CityEntry('Sagar', [
      StationEntry('Civil Lines, Sagar - MPPCB', 'civil-lines-sagar-mppcb'),
      StationEntry('Deen Dayal Nagar, Sagar - MPPCB', 'deen-dayal-nagar-sagar-mppcb'),
    ]),
    CityEntry('Satna', [
      StationEntry('Bandhavgar Colony, Satna - Birla Cement', 'bandhavgar-colony-satna-birla-cement'),
    ]),
    CityEntry('Singrauli', [
      StationEntry('Suryakiran Bhawan NCL, Singrauli - MPPCB', 'suryakiran-bhawan-ncl-singrauli-mppcb'),
    ]),
    CityEntry('Ujjain', [
      StationEntry('Mahakaleshwar Temple, Ujjain - MPPCB', 'mahakaleshwar-temple-ujjain-mppcb'),
      StationEntry('Mahashweta Nagar, Ujjain - MPPCB', 'mahashweta-nagar-ujjain-mppcb'),
    ]),
  ]),
  StateEntry('Maharashtra', [
    CityEntry('Ahmednagar', [
      StationEntry('Tarakpur, Ahmednagar - MPCB', 'tarakpur-ahmednagar-mpcb'),
    ]),
    CityEntry('Akola', [
      StationEntry('Ramdaspeth, Akola - MPCB', 'ramdaspeth-akola-mpcb'),
    ]),
    CityEntry('Ambernath', [
      StationEntry('Chinchpada, Ambernath - MPCB', 'chinchpada-ambernath-mpcb'),
    ]),
    CityEntry('Amravati', [
      StationEntry('Shivneri Colony, Amravati - MPCB', 'shivneri-colony-amravati-mpcb'),
      StationEntry('Shri Shivaji Science College, Amravati - MPCB', 'shri-shivaji-science-college-amravati-mpcb'),
    ]),
    CityEntry('Aurangabad', [
      StationEntry('MIDC Chilkalthana, Aurangabad - MPCB', 'midc-chilkalthana-aurangabad-mpcb'),
      StationEntry('More Chowk Waluj, Aurangabad - MPCB', 'more-chowk-waluj-aurangabad-mpcb'),
      StationEntry('Rachnakar Colony, Aurangabad - MPCB', 'rachnakar-colony-aurangabad-mpcb'),
    ]),
    CityEntry('Badlapur', [
      StationEntry('Katrap, Badlapur - MPCB', 'katrap-badlapur-mpcb'),
    ]),
    CityEntry('Beed', [
      StationEntry('Bir, Beed - MPCB', 'bir-beed-mpcb'),
    ]),
    CityEntry('Belapur', [
      StationEntry('CBD Belapur, Belapur - MPCB', 'cbd-belapur-belapur-mpcb'),
    ]),
    CityEntry('Bhiwandi', [
      StationEntry('Gokul Nagar, Bhiwandi - MPCB', 'gokul-nagar-bhiwandi-mpcb'),
    ]),
    CityEntry('Boisar', [
      StationEntry('Khaira, Boisar - MPCB', 'khaira-boisar-mpcb'),
    ]),
    CityEntry('Chandrapur', [
      StationEntry('Chauhan Colony, Chandrapur - MPCB', 'chauhan-colony-chandrapur-mpcb'),
      StationEntry('MIDC Khutala, Chandrapur - MPCB', 'midc-khutala-chandrapur-mpcb'),
    ]),
    CityEntry('Dhule', [
      StationEntry('Deopur, Dhule - MPCB', 'deopur-dhule-mpcb'),
    ]),
    CityEntry('Dombivli', [
      StationEntry('Kalu Nagar, Dombivli - MPCB', 'kalu-nagar-dombivli-mpcb'),
    ]),
    CityEntry('Hingoli', [
      StationEntry('Ashta Vinayak Nagar, Hingoli - MPCB', 'ashta-vinayak-nagar-hingoli-mpcb'),
    ]),
    CityEntry('Jalgaon', [
      StationEntry('Prabhat Colony, Jalgaon - MPCB', 'prabhat-colony-jalgaon-mpcb'),
    ]),
    CityEntry('Jalna', [
      StationEntry('Old MIDC, Jalna - MPCB', 'old-midc-jalna-mpcb'),
    ]),
    CityEntry('Kalyan', [
      StationEntry('Khadakpada, Kalyan - MPCB', 'khadakpada-kalyan-mpcb'),
      StationEntry('Pimpleshwar Mandir, Kalyan - MPCB', 'pimpleshwar-mandir-kalyan-mpcb'),
    ]),
    CityEntry('Kolhapur', [
      StationEntry('Shivaji University, Kolhapur - MPCB', 'shivaji-university-kolhapur-mpcb'),
      StationEntry('Sinchan Bhavan, Kolhapur - MPCB', 'sinchan-bhavan-kolhapur-mpcb'),
    ]),
    CityEntry('Latur', [
      StationEntry('Sawe Wadi, Latur - MPCB', 'sawe-wadi-latur-mpcb'),
    ]),
    CityEntry('Mahad', [
      StationEntry('Kamble Tarf Birwadi, Mahad - MPCB', 'kamble-tarf-birwadi-mahad-mpcb'),
    ]),
    CityEntry('Malegaon', [
      StationEntry('Mahesh Nagar, Malegaon - MPCB', 'mahesh-nagar-malegaon-mpcb'),
    ]),
    CityEntry('Mira-Bhayandar', [
      StationEntry('Bhayandar West, Mira-Bhayandar - MPCB', 'bhayandar-west-mira-bhayandar-mpcb'),
    ]),
    CityEntry('Mumbai', [
      StationEntry('Bandra Kurla Complex, Mumbai - IITM', 'bandra-kurla-complex-mumbai-iitm'),
      StationEntry('Bandra Kurla Complex, Mumbai - MPCB', 'bandra-kurla-complex-mumbai-mpcb'),
      StationEntry('Bandra, Mumbai - MPCB', 'bandra-mumbai-mpcb'),
      StationEntry('Borivali East, Mumbai - IITM', 'borivali-east-mumbai-iitm'),
      StationEntry('Borivali East, Mumbai - MPCB', 'borivali-east-mumbai-mpcb'),
      StationEntry('Byculla, Mumbai - BMC', 'byculla-mumbai-bmc'),
      StationEntry('Chakala-Andheri East, Mumbai - IITM', 'chakala-andheri-east-mumbai-iitm'),
      StationEntry('Chembur, Mumbai - MPCB', 'chembur-mumbai-mpcb'),
      StationEntry('Chhatrapati Shivaji Intl. Airport (T2), Mumbai - MPCB', 'chhatrapati-shivaji-intl-airport-t2-mumbai-mpcb'),
      StationEntry('Colaba, Mumbai - MPCB', 'colaba-mumbai-mpcb'),
      StationEntry('Deonar, Mumbai - IITM', 'deonar-mumbai-iitm'),
      StationEntry('Ghatkopar, Mumbai - BMC', 'ghatkopar-mumbai-bmc'),
      StationEntry('Kandivali East, Mumbai - MPCB', 'kandivali-east-mumbai-mpcb'),
      StationEntry('Kandivali West, Mumbai - BMC', 'kandivali-west-mumbai-bmc'),
      StationEntry('Kherwadi_Bandra East, Mumbai - MPCB', 'kherwadi-bandra-east-mumbai-mpcb'),
      StationEntry('Khindipada-Bhandup West, Mumbai - IITM', 'khindipada-bhandup-west-mumbai-iitm'),
      StationEntry('Kurla, Mumbai - MPCB', 'kurla-mumbai-mpcb'),
      StationEntry('Malad West, Mumbai - IITM', 'malad-west-mumbai-iitm'),
      StationEntry('Mazgaon, Mumbai - IITM', 'mazgaon-mumbai-iitm'),
      StationEntry('Mindspace-Malad West, Mumbai - MPCB', 'mindspace-malad-west-mumbai-mpcb'),
      StationEntry('Mulund West, Mumbai - MPCB', 'mulund-west-mumbai-mpcb'),
      StationEntry('Navy Nagar-Colaba, Mumbai - IITM', 'navy-nagar-colaba-mumbai-iitm'),
      StationEntry('Powai, Mumbai - MPCB', 'powai-mumbai-mpcb'),
      StationEntry('Sewri, Mumbai - BMC', 'sewri-mumbai-bmc'),
      StationEntry('Shivaji Nagar, Mumbai - BMC', 'shivaji-nagar-mumbai-bmc'),
      StationEntry('Siddharth Nagar-Worli, Mumbai - IITM', 'siddharth-nagar-worli-mumbai-iitm'),
      StationEntry('Sion, Mumbai - MPCB', 'sion-mumbai-mpcb'),
      StationEntry('Vasai West, Mumbai - MPCB', 'vasai-west-mumbai-mpcb'),
      StationEntry('Vile Parle West, Mumbai - MPCB', 'vile-parle-west-mumbai-mpcb'),
      StationEntry('Worli, Mumbai -MPCB', 'worli-mumbai-mpcb'),
    ]),
    CityEntry('Nagpur', [
      StationEntry('Ambazari, Nagpur - MPCB', 'ambazari-nagpur-mpcb'),
      StationEntry('Mahal, Nagpur - MPCB', 'mahal-nagpur-mpcb'),
      StationEntry('Opp GPO Civil Lines, Nagpur - MPCB', 'opp-gpo-civil-lines-nagpur-mpcb'),
      StationEntry('Ram Nagar, Nagpur - MPCB', 'ram-nagar-nagpur-mpcb'),
    ]),
    CityEntry('Nanded', [
      StationEntry('Sneh Nagar, Nanded - MPCB', 'sneh-nagar-nanded-mpcb'),
    ]),
    CityEntry('Nashik', [
      StationEntry('Gangapur Road, Nashik - MPCB', 'gangapur-road-nashik-mpcb'),
      StationEntry('Hirawadi, Nashik - MPCB', 'hirawadi-nashik-mpcb'),
      StationEntry('MIDC Ambad, Nashik - MPCB', 'midc-ambad-nashik-mpcb'),
      StationEntry('Pandav Nagari, Nashik - MPCB', 'pandav-nagari-nashik-mpcb'),
    ]),
    CityEntry('Navi Mumbai', [
      StationEntry('Airoli, Navi Mumbai - MPCB', 'airoli-navi-mumbai-mpcb'),
      StationEntry('Kopripada-Vashi, Navi Mumbai - MPCB', 'kopripada-vashi-navi-mumbai-mpcb'),
      StationEntry('Mahape, Navi Mumbai - MPCB', 'mahape-navi-mumbai-mpcb'),
      StationEntry('Nerul, Navi Mumbai - MPCB', 'nerul-navi-mumbai-mpcb'),
      StationEntry('Sanpada, Navi Mumbai - MPCB', 'sanpada-navi-mumbai-mpcb'),
      StationEntry('Sector-19A Nerul, Navi Mumbai - IITM', 'sector-19a-nerul-navi-mumbai-iitm'),
      StationEntry('Sector-2E Kalamboli, Navi Mumbai - MPCB', 'sector-2e-kalamboli-navi-mumbai-mpcb'),
      StationEntry('Tondare-Taloja, Navi Mumbai - MPCB', 'tondare-taloja-navi-mumbai-mpcb'),
    ]),
    CityEntry('Parbhani', [
      StationEntry('Masoom Colony, Parbhani - MPCB', 'masoom-colony-parbhani-mpcb'),
    ]),
    CityEntry('Pimpri-Chinchwad', [
      StationEntry('Alandi, Pune - IITM', 'alandi-pune-iitm'),
      StationEntry('Bhosari, Pune - IITM', 'bhosari-pune-iitm'),
      StationEntry('Bhumkar Nagar, Pune - IITM', 'bhumkar-nagar-pune-iitm'),
      StationEntry('Gavalinagar, Pimpri Chinchwad - MPCB', 'gavalinagar-pimpri-chinchwad-mpcb'),
      StationEntry('Park Street Wakad, Pimpri Chinchwad - MPCB', 'park-street-wakad-pimpri-chinchwad-mpcb'),
      StationEntry('Savta Mali Nagar, Pimpri-Chinchwad - IITM', 'savta-mali-nagar-pimpri-chinchwad-iitm'),
      StationEntry('Thergaon, Pimpri Chinchwad - MPCB', 'thergaon-pimpri-chinchwad-mpcb'),
      StationEntry('Transport Nagar-Nigdi, Pune - IITM', 'transport-nagar-nigdi-pune-iitm'),
    ]),
    CityEntry('Pune', [
      StationEntry('Dhankawadi, Pune - IITM', 'dhankawadi-pune-iitm'),
      StationEntry('Hadapsar, Pune - IITM', 'hadapsar-pune-iitm'),
      StationEntry('Karve Road, Pune - MPCB', 'karve-road-pune-mpcb'),
      StationEntry('Katraj Dairy, Pune - MPCB', 'katraj-dairy-pune-mpcb'),
      StationEntry('MIT-Kothrud, Pune - IITM', 'mit-kothrud-pune-iitm'),
      StationEntry('Mhada Colony, Pune - IITM', 'mhada-colony-pune-iitm'),
      StationEntry('Panchawati_Pashan, Pune - IITM', 'panchawati-pashan-pune-iitm'),
      StationEntry('Revenue Colony-Shivajinagar, Pune - IITM', 'revenue-colony-shivajinagar-pune-iitm'),
      StationEntry('Savitribai Phule Pune University, Pune - MPCB', 'savitribai-phule-pune-university-pune-mpcb'),
    ]),
    CityEntry('Sangli', [
      StationEntry('Vijay Nagar, Sangli - MPCB', 'vijay-nagar-sangli-mpcb'),
    ]),
    CityEntry('Solapur', [
      StationEntry('Dnyaneshwar Nagar, Solapur - MPCB', 'dnyaneshwar-nagar-solapur-mpcb'),
      StationEntry('Ratandeep Housing Society, Solapur - MPCB', 'ratandeep-housing-society-solapur-mpcb'),
      StationEntry('Solapur, Solapur - MPCB', 'solapur-solapur-mpcb'),
    ]),
    CityEntry('Thane', [
      StationEntry('Kasarvadavali, Thane - MPCB', 'kasarvadavali-thane-mpcb'),
      StationEntry('Upvan Fort, Thane - MPCB', 'upvan-fort-thane-mpcb'),
    ]),
    CityEntry('Ulhasnagar', [
      StationEntry('Sidhi Vinayak Nagar, Ulhasnagar - MPCB', 'sidhi-vinayak-nagar-ulhasnagar-mpcb'),
      StationEntry('Vithalwadi, Ulhasnagar - MPCB', 'vithalwadi-ulhasnagar-mpcb'),
    ]),
    CityEntry('Virar', [
      StationEntry('Bolinj, Virar - MPCB', 'bolinj-virar-mpcb'),
    ]),
  ]),
  StateEntry('Manipur', [
    CityEntry('Imphal', [
      StationEntry('DM College of Science, Imphal - Manipur PCB', 'dm-college-of-science-imphal-manipur-pcb'),
      StationEntry('Manipur University, Imphal - Manipur PCB', 'manipur-university-imphal-manipur-pcb'),
    ]),
  ]),
  StateEntry('Meghalaya', [
    CityEntry('Byrnihat', [
      StationEntry('15th Mile-Nongthymmai, Byrnihat - Meghalaya PCB', '15th-mile-nongthymmai-byrnihat-meghalaya-pcb'),
    ]),
    CityEntry('Shillong', [
      StationEntry('JN Stadium, Shillong - Meghalaya PCB', 'jn-stadium-shillong-meghalaya-pcb'),
      StationEntry('Lumpyngngad, Shillong - Meghalaya PCB', 'lumpyngngad-shillong-meghalaya-pcb'),
    ]),
  ]),
  StateEntry('Mizoram', [
    CityEntry('Aizawl', [
      StationEntry('Sikulpuikawn, Aizawl - Mizoram PCB', 'sikulpuikawn-aizawl-mizoram-pcb'),
    ]),
  ]),
  StateEntry('Nagaland', [
    CityEntry('Kohima', [
      StationEntry('PWD Junction, Kohima - NPCB', 'pwd-junction-kohima-npcb'),
    ]),
  ]),
  StateEntry('Odisha', [
    CityEntry('Angul', [
      StationEntry('Hakimapada, Angul - OSPCB', 'hakimapada-angul-ospcb'),
    ]),
    CityEntry('Balasore', [
      StationEntry('Kalidaspur, Balasore - OSPCB', 'kalidaspur-balasore-ospcb'),
    ]),
    CityEntry('Barbil', [
      StationEntry('Forest Office, Barbil - OSPCB', 'forest-office-barbil-ospcb'),
    ]),
    CityEntry('Baripada', [
      StationEntry('Meher Colony, Baripada - OSPCB', 'meher-colony-baripada-ospcb'),
    ]),
    CityEntry('Bhubaneswar', [
      StationEntry('Lingraj Mandir, Bhubaneswar - OSPCB', 'lingraj-mandir-bhubaneswar-ospcb'),
      StationEntry('Patia, Bhubaneswar - OSPCB', 'patia-bhubaneswar-ospcb'),
    ]),
    CityEntry('Bileipada', [
      StationEntry('Tata Township, Bileipada - OSPCB', 'tata-township-bileipada-ospcb'),
    ]),
    CityEntry('Brajrajnagar', [
      StationEntry('GM Office, Brajrajnagar - OSPCB', 'gm-office-brajrajnagar-ospcb'),
    ]),
    CityEntry('Byasanagar', [
      StationEntry('Ferro Chrome Colony, Byasanagar - OSPCB', 'ferro-chrome-colony-byasanagar-ospcb'),
    ]),
    CityEntry('Cuttack', [
      StationEntry('CDA Area, Cuttack - OSPCB', 'cda-area-cuttack-ospcb'),
    ]),
    CityEntry('Keonjhar', [
      StationEntry('Jagamohanpur, Keonjhar - OSPCB', 'jagamohanpur-keonjhar-ospcb'),
    ]),
    CityEntry('Nayagarh', [
      StationEntry('Dabuna, Nayagarh - OSPCB', 'dabuna-nayagarh-ospcb'),
    ]),
    CityEntry('Rairangpur', [
      StationEntry('Divisional Forest Office, Rairangpur - OSPCB', 'divisional-forest-office-rairangpur-ospcb'),
    ]),
    CityEntry('Rourkela', [
      StationEntry('Fertilizer Township, Rourkela - OSPCB', 'fertilizer-township-rourkela-ospcb'),
      StationEntry('Raghunathpali, Rourkela - OSPCB', 'raghunathpali-rourkela-ospcb'),
      StationEntry('Sector-2, Rourkela - OSPCB', 'sector-2-rourkela-ospcb'),
    ]),
    CityEntry('Suakati', [
      StationEntry('OMC Colony, Suakati - OSPCB', 'omc-colony-suakati-ospcb'),
    ]),
    CityEntry('Talcher', [
      StationEntry('Talcher Coalfields,Talcher - OSPCB', 'talcher-coalfields-talcher-ospcb'),
    ]),
    CityEntry('Tensa', [
      StationEntry('Barsua Iron Ore Mines, Tensa - OSPCB', 'barsua-iron-ore-mines-tensa-ospcb'),
    ]),
  ]),
  StateEntry('Puducherry', [
    CityEntry('Puducherry', [
      StationEntry('Jawahar Nagar, Puducherry - PPCC', 'jawahar-nagar-puducherry-ppcc'),
    ]),
  ]),
  StateEntry('Punjab', [
    CityEntry('Amritsar', [
      StationEntry('Golden Temple, Amritsar - PPCB', 'golden-temple-amritsar-ppcb'),
    ]),
    CityEntry('Bathinda', [
      StationEntry('Hardev Nagar, Bathinda - PPCB', 'hardev-nagar-bathinda-ppcb'),
    ]),
    CityEntry('Jalandhar', [
      StationEntry('Civil Line, Jalandhar - PPCB', 'civil-line-jalandhar-ppcb'),
    ]),
    CityEntry('Khanna', [
      StationEntry('Kalal Majra, Khanna - PPCB', 'kalal-majra-khanna-ppcb'),
    ]),
    CityEntry('Ludhiana', [
      StationEntry('Punjab Agricultural University, Ludhiana - PPCB', 'punjab-agricultural-university-ludhiana-ppcb'),
    ]),
    CityEntry('Mandi Gobindgarh', [
      StationEntry('RIMT University, Mandi Gobindgarh - PPCB', 'rimt-university-mandi-gobindgarh-ppcb'),
    ]),
    CityEntry('Patiala', [
      StationEntry('Model Town, Patiala - PPCB', 'model-town-patiala-ppcb'),
    ]),
    CityEntry('Rupnagar', [
      StationEntry('Ratanpura, Rupnagar - Ambuja Cements', 'ratanpura-rupnagar-ambuja-cements'),
    ]),
  ]),
  StateEntry('Rajasthan', [
    CityEntry('Ajmer', [
      StationEntry('Civil Lines,  Ajmer - RSPCB', 'civil-lines-ajmer-rspcb'),
    ]),
    CityEntry('Alwar', [
      StationEntry('Moti Doongri, Alwar - RSPCB', 'moti-doongri-alwar-rspcb'),
    ]),
    CityEntry('Banswara', [
      StationEntry('Rati Talai, Banswara - RSPCB', 'rati-talai-banswara-rspcb'),
    ]),
    CityEntry('Baran', [
      StationEntry('Bamboliya, Baran - RSPCB', 'bamboliya-baran-rspcb'),
    ]),
    CityEntry('Barmer', [
      StationEntry('Railway Colony, Barmer - RSPCB', 'railway-colony-barmer-rspcb'),
    ]),
    CityEntry('Bharatpur', [
      StationEntry('Krishna Nagar, Bharatpur - RSPCB', 'krishna-nagar-bharatpur-rspcb'),
    ]),
    CityEntry('Bhilwara', [
      StationEntry('Pratap Nagar, Bhilwara - RSPCB', 'pratap-nagar-bhilwara-rspcb'),
    ]),
    CityEntry('Bhiwadi', [
      StationEntry('RIICO Ind. Area III, Bhiwadi - RSPCB', 'riico-ind-area-iii-bhiwadi-rspcb'),
      StationEntry('Vasundhara Nagar_UIT, Bhiwadi - RSPCB', 'vasundhara-nagar-uit-bhiwadi-rspcb'),
    ]),
    CityEntry('Bikaner', [
      StationEntry('MM Ground, Bikaner - RSPCB', 'mm-ground-bikaner-rspcb'),
    ]),
    CityEntry('Bundi', [
      StationEntry('New Colony, Bundi - RSPCB', 'new-colony-bundi-rspcb'),
    ]),
    CityEntry('Chittorgarh', [
      StationEntry('Shastri Nagar, Chittorgarh - RSPCB', 'shastri-nagar-chittorgarh-rspcb'),
    ]),
    CityEntry('Churu', [
      StationEntry('Subash Chowk, Churu - RSPCB', 'subash-chowk-churu-rspcb'),
    ]),
    CityEntry('Dausa', [
      StationEntry('Khatikan Mohalla, Dausa - RSPCB', 'khatikan-mohalla-dausa-rspcb'),
    ]),
    CityEntry('Dholpur', [
      StationEntry('Raja Ganj, Dholpur - RSPCB', 'raja-ganj-dholpur-rspcb'),
    ]),
    CityEntry('Dungarpur', [
      StationEntry('Bhoiwada, Dungarpur - RSPCB', 'bhoiwada-dungarpur-rspcb'),
    ]),
    CityEntry('Hanumangarh', [
      StationEntry('Housing Board, Hanumangarh - RSPCB', 'housing-board-hanumangarh-rspcb'),
    ]),
    CityEntry('Jaipur', [
      StationEntry('Adarsh Nagar, Jaipur - RSPCB', 'adarsh-nagar-jaipur-rspcb'),
      StationEntry('Mansarovar Sector-12, Jaipur - RSPCB', 'mansarovar-sector-12-jaipur-rspcb'),
      StationEntry('Police Commissionerate, Jaipur - RSPCB', 'police-commissionerate-jaipur-rspcb'),
      StationEntry('RIICO Sitapura, Jaipur - RSPCB', 'riico-sitapura-jaipur-rspcb'),
      StationEntry('Sector-2 Murlipura, Jaipur - RSPCB', 'sector-2-murlipura-jaipur-rspcb'),
      StationEntry('Shastri Nagar, Jaipur - RSPCB', 'shastri-nagar-jaipur-rspcb'),
    ]),
    CityEntry('Jaisalmer', [
      StationEntry('Sadar Bazar, Jaisalmer - RSPCB', 'sadar-bazar-jaisalmer-rspcb'),
    ]),
    CityEntry('Jalore', [
      StationEntry('Mudtra Sili, Jalore - RSPCB', 'mudtra-sili-jalore-rspcb'),
    ]),
    CityEntry('Jhalawar', [
      StationEntry('Rajlaxmi Nagar, Jhalawar - RSPCB', 'rajlaxmi-nagar-jhalawar-rspcb'),
    ]),
    CityEntry('Jhunjhunu', [
      StationEntry('Indra Nagar, Jhunjhunu - RSPCB', 'indra-nagar-jhunjhunu-rspcb'),
    ]),
    CityEntry('Jodhpur', [
      StationEntry('Collectorate, Jodhpur - RSPCB', 'collectorate-jodhpur-rspcb'),
      StationEntry('Digari Kalan, Jodhpur - RSPCB', 'digari-kalan-jodhpur-rspcb'),
      StationEntry('Jhalamand, Jodhpur - RSPCB', 'jhalamand-jodhpur-rspcb'),
      StationEntry('Mandor, Jodhpur - RSPCB', 'mandor-jodhpur-rspcb'),
      StationEntry('Samrat Ashok Udhyan, Jodhpur - RSPCB', 'samrat-ashok-udhyan-jodhpur-rspcb'),
    ]),
    CityEntry('Karauli', [
      StationEntry('Satyawati Vihar, Karauli - RSPCB', 'satyawati-vihar-karauli-rspcb'),
    ]),
    CityEntry('Kota', [
      StationEntry('Dhanmandi, Kota - RSPCB', 'dhanmandi-kota-rspcb'),
      StationEntry('Nayapura, Kota - RSPCB', 'nayapura-kota-rspcb'),
      StationEntry('Shrinath Puram, Kota - RSPCB', 'shrinath-puram-kota-rspcb'),
    ]),
    CityEntry('Nagaur', [
      StationEntry('Karni Colony, Nagaur - RSPCB', 'karni-colony-nagaur-rspcb'),
    ]),
    CityEntry('Pali', [
      StationEntry('Indira Colony Vistar, Pali - RSPCB', 'indira-colony-vistar-pali-rspcb'),
    ]),
    CityEntry('Pratapgarh', [
      StationEntry('Pragati Nagar, Pratapgarh - RSPCB', 'pragati-nagar-pratapgarh-rspcb'),
    ]),
    CityEntry('Rajsamand', [
      StationEntry('Dhoinda, Rajsamand - RSPCB', 'dhoinda-rajsamand-rspcb'),
    ]),
    CityEntry('Sawai Madhopur', [
      StationEntry('Sahu Nagar, Sawai Madhopur - RSPCB', 'sahu-nagar-sawai-madhopur-rspcb'),
    ]),
    CityEntry('Sikar', [
      StationEntry('Radhakishan Pura, Sikar - RSPCB', 'radhakishan-pura-sikar-rspcb'),
    ]),
    CityEntry('Sirohi', [
      StationEntry('Vedhaynath Colony, Sirohi - RSPCB', 'vedhaynath-colony-sirohi-rspcb'),
    ]),
    CityEntry('Sri Ganganagar', [
      StationEntry('Old City, Sri Ganganagar - RSPCB', 'old-city-sri-ganganagar-rspcb'),
    ]),
    CityEntry('Tonk', [
      StationEntry('Shastri Nagar, Tonk - RSPCB', 'shastri-nagar-tonk-rspcb'),
    ]),
    CityEntry('Udaipur', [
      StationEntry('Ashok Nagar, Udaipur - RSPCB', 'ashok-nagar-udaipur-rspcb'),
    ]),
  ]),
  StateEntry('Sikkim', [
    CityEntry('Gangtok', [
      StationEntry('Zero Point GICI, Gangtok - SSPCB', 'zero-point-gici-gangtok-sspcb'),
    ]),
  ]),
  StateEntry('Tamil Nadu', [
    CityEntry('Ariyalur', [
      StationEntry('Keelapalur, Ariyalur - TNPCB', 'keelapalur-ariyalur-tnpcb'),
    ]),
    CityEntry('Chengalpattu', [
      StationEntry('Crescent University, Chengalpattu - TNPCB', 'crescent-university-chengalpattu-tnpcb'),
    ]),
    CityEntry('Chennai', [
      StationEntry('Alandur Bus Depot, Chennai - CPCB', 'alandur-bus-depot-chennai-cpcb'),
      StationEntry('Arumbakkam, Chennai - TNPCB', 'arumbakkam-chennai-tnpcb'),
      StationEntry('Gandhi Nagar_Ennore, Chennai - TNPCB', 'gandhi-nagar-ennore-chennai-tnpcb'),
      StationEntry('Kodungaiyur, Chennai - TNPCB', 'kodungaiyur-chennai-tnpcb'),
      StationEntry('Manali Village, Chennai - TNPCB', 'manali-village-chennai-tnpcb'),
      StationEntry('Manali, Chennai - CPCB', 'manali-chennai-cpcb'),
      StationEntry('Perungudi, Chennai - TNPCB', 'perungudi-chennai-tnpcb'),
      StationEntry('Royapuram, Chennai - TNPCB', 'royapuram-chennai-tnpcb'),
      StationEntry('Velachery Res. Area, Chennai - CPCB', 'velachery-res-area-chennai-cpcb'),
    ]),
    CityEntry('Coimbatore', [
      StationEntry('PSG College of Arts and Science, Coimbatore - TNPCB', 'psg-college-of-arts-and-science-coimbatore-tnpcb'),
      StationEntry('SIDCO Kurichi, Coimbatore - TNPCB', 'sidco-kurichi-coimbatore-tnpcb'),
    ]),
    CityEntry('Cuddalore', [
      StationEntry('Kudikadu, Cuddalore - TNPCB', 'kudikadu-cuddalore-tnpcb'),
      StationEntry('Semmandalam, Cuddalore - TNPCB', 'semmandalam-cuddalore-tnpcb'),
    ]),
    CityEntry('Dindigul', [
      StationEntry('Mendonsa Colony, Dindigul - TNPCB', 'mendonsa-colony-dindigul-tnpcb'),
    ]),
    CityEntry('Gummidipoondi', [
      StationEntry('Anthoni Pillai Nagar, Gummidipoondi - TNPCB', 'anthoni-pillai-nagar-gummidipoondi-tnpcb'),
    ]),
    CityEntry('Hosur', [
      StationEntry('SIPCOT Phase-1, Hosur - TNPCB', 'sipcot-phase-1-hosur-tnpcb'),
    ]),
    CityEntry('Kanchipuram', [
      StationEntry('Kilambi, Kanchipuram - TNPCB', 'kilambi-kanchipuram-tnpcb'),
    ]),
    CityEntry('Karur', [
      StationEntry('Kamadenu Nagar, Karur - TNPCB', 'kamadenu-nagar-karur-tnpcb'),
    ]),
    CityEntry('Madurai', [
      StationEntry('Uchapatti, Madurai - TNPCB', 'uchapatti-madurai-tnpcb'),
    ]),
    CityEntry('Nagapattinam', [
      StationEntry('Velippalayam, Nagapattinam - TNPCB', 'velippalayam-nagapattinam-tnpcb'),
    ]),
    CityEntry('Namakkal', [
      StationEntry('Ponnusamy Nagar, Namakkal - TNPCB', 'ponnusamy-nagar-namakkal-tnpcb'),
    ]),
    CityEntry('Ooty', [
      StationEntry('Bombay Castel, Ooty - TNPCB', 'bombay-castel-ooty-tnpcb'),
    ]),
    CityEntry('Palkalaiperur', [
      StationEntry('Bharathidasan University, Palkalaiperur - TNPCB', 'bharathidasan-university-palkalaiperur-tnpcb'),
    ]),
    CityEntry('Perundurai', [
      StationEntry('SIPCOT Industrial Park, Perundurai - TNPCB', 'sipcot-industrial-park-perundurai-tnpcb'),
    ]),
    CityEntry('Pudukottai', [
      StationEntry('SIPCOT Nathampannai, Pudukottai - TNPCB', 'sipcot-nathampannai-pudukottai-tnpcb'),
    ]),
    CityEntry('Ramanathapuram', [
      StationEntry('Chalai Bazaar, Ramanathapuram - TNPCB', 'chalai-bazaar-ramanathapuram-tnpcb'),
    ]),
    CityEntry('Ranipet', [
      StationEntry('VOC Nagar_SIPCOT, Ranipet - TNPCB', 'voc-nagar-sipcot-ranipet-tnpcb'),
    ]),
    CityEntry('Salem', [
      StationEntry('Sona College of Technology, Salem - TNPCB', 'sona-college-of-technology-salem-tnpcb'),
    ]),
    CityEntry('Thanjavur', [
      StationEntry('Parisutham Nagar, Thanjavur - TNPCB', 'parisutham-nagar-thanjavur-tnpcb'),
    ]),
    CityEntry('Thoothukudi', [
      StationEntry('Meelavittan, Thoothukudi - TNPCB', 'meelavittan-thoothukudi-tnpcb'),
    ]),
    CityEntry('Tiruchirappalli', [
      StationEntry('St Joseph College, Tiruchirappalli - TNPCB', 'st-joseph-college-tiruchirappalli-tnpcb'),
    ]),
    CityEntry('Tirunelveli', [
      StationEntry('Municipal Corporation Office, Tirunelveli - TNPCB', 'municipal-corporation-office-tirunelveli-tnpcb'),
    ]),
    CityEntry('Tirupur', [
      StationEntry('Kumaran College, Tirupur - TNPCB', 'kumaran-college-tirupur-tnpcb'),
    ]),
    CityEntry('Vellore', [
      StationEntry('Vasanthapuram, Vellore - TNPCB', 'vasanthapuram-vellore-tnpcb'),
    ]),
    CityEntry('Virudhunagar', [
      StationEntry('Collectorate Office, Virudhunagar - TNPCB', 'collectorate-office-virudhunagar-tnpcb'),
    ]),
  ]),
  StateEntry('Telangana', [
    CityEntry('Hyderabad', [
      StationEntry('Bollaram Industrial Area, Hyderabad - TSPCB', 'bollaram-industrial-area-hyderabad-tspcb'),
      StationEntry('Central University, Hyderabad - TSPCB', 'central-university-hyderabad-tspcb'),
      StationEntry('ECIL Kapra, Hyderabad - TSPCB', 'ecil-kapra-hyderabad-tspcb'),
      StationEntry('ICRISAT Patancheru, Hyderabad - TSPCB', 'icrisat-patancheru-hyderabad-tspcb'),
      StationEntry('IDA Pashamylaram, Hyderabad - TSPCB', 'ida-pashamylaram-hyderabad-tspcb'),
      StationEntry('IITH Kandi, Hyderabad - TSPCB', 'iith-kandi-hyderabad-tspcb'),
      StationEntry('Kokapet, Hyderabad - TSPCB', 'kokapet-hyderabad-tspcb'),
      StationEntry('Kompally Municipal Office, Hyderabad - TSPCB', 'kompally-municipal-office-hyderabad-tspcb'),
      StationEntry('Nacharam_TSIIC IALA, Hyderabad - TSPCB', 'nacharam-tsiic-iala-hyderabad-tspcb'),
      StationEntry('New Malakpet, Hyderabad - TSPCB', 'new-malakpet-hyderabad-tspcb'),
      StationEntry('Ramachandrapuram, Hyderabad - TSPCB', 'ramachandrapuram-hyderabad-tspcb'),
      StationEntry('Sanathnagar, Hyderabad - TSPCB', 'sanathnagar-hyderabad-tspcb'),
      StationEntry('Somajiguda, Hyderabad - TSPCB', 'somajiguda-hyderabad-tspcb'),
      StationEntry('Zoo Park, Hyderabad - TSPCB', 'zoo-park-hyderabad-tspcb'),
    ]),
  ]),
  StateEntry('Tripura', [
    CityEntry('Agartala', [
      StationEntry('Bardowali, Agartala - Tripura SPCB', 'bardowali-agartala-tripura-spcb'),
      StationEntry('Kunjaban, Agartala - Tripura SPCB', 'kunjaban-agartala-tripura-spcb'),
    ]),
  ]),
  StateEntry('Uttar Pradesh', [
    CityEntry('Agra', [
      StationEntry('Manoharpur, Agra - UPPCB', 'manoharpur-agra-uppcb'),
      StationEntry('Rohta, Agra - UPPCB', 'rohta-agra-uppcb'),
      StationEntry('Sanjay Palace, Agra - UPPCB', 'sanjay-palace-agra-uppcb'),
      StationEntry('Sector-3B Avas Vikas Colony, Agra - UPPCB', 'sector-3b-avas-vikas-colony-agra-uppcb'),
      StationEntry('Shahjahan Garden, Agra - UPPCB', 'shahjahan-garden-agra-uppcb'),
      StationEntry('Shastripuram, Agra - UPPCB', 'shastripuram-agra-uppcb'),
    ]),
    CityEntry('Baghpat', [
      StationEntry('New Collectorate, Baghpat - UPPCB', 'new-collectorate-baghpat-uppcb'),
      StationEntry('Sardar Patel Inter College, Baghpat - UPPCB', 'sardar-patel-inter-college-baghpat-uppcb'),
    ]),
    CityEntry('Bareilly', [
      StationEntry('Civil Lines, Bareilly - UPPCB', 'civil-lines-bareilly-uppcb'),
      StationEntry('Rajendra Nagar, Bareilly - UPPCB', 'rajendra-nagar-bareilly-uppcb'),
    ]),
    CityEntry('Bulandshahr', [
      StationEntry('Yamunapuram, Bulandshahr - UPPCB', 'yamunapuram-bulandshahr-uppcb'),
    ]),
    CityEntry('Firozabad', [
      StationEntry('Nagla Bhau, Firozabad - UPPCB', 'nagla-bhau-firozabad-uppcb'),
      StationEntry('Vibhab Nagar, Firozabad - UPPCB', 'vibhab-nagar-firozabad-uppcb'),
    ]),
    CityEntry('Ghaziabad', [
      StationEntry('Indirapuram, Ghaziabad - UPPCB', 'indirapuram-ghaziabad-uppcb'),
      StationEntry('Loni, Ghaziabad - UPPCB', 'loni-ghaziabad-uppcb'),
      StationEntry('Sanjay Nagar, Ghaziabad - UPPCB', 'sanjay-nagar-ghaziabad-uppcb'),
      StationEntry('Vasundhara, Ghaziabad - UPPCB', 'vasundhara-ghaziabad-uppcb'),
      StationEntry('Ved Vihar-Loni, Ghaziabad - UPPCB', 'ved-vihar-loni-ghaziabad-uppcb'),
    ]),
    CityEntry('Gorakhpur', [
      StationEntry('Madan Mohan Malaviya University of Technology, Gorakhpur - UPPCB', 'madan-mohan-malaviya-university-of-technology-gorakhpur-uppcb'),
    ]),
    CityEntry('Greater Noida', [
      StationEntry('Knowledge Park - III, Greater Noida - UPPCB', 'knowledge-park-iii-greater-noida-uppcb'),
      StationEntry('Knowledge Park - V, Greater Noida - UPPCB', 'knowledge-park-v-greater-noida-uppcb'),
    ]),
    CityEntry('Hapur', [
      StationEntry('Anand Vihar, Hapur - UPPCB', 'anand-vihar-hapur-uppcb'),
    ]),
    CityEntry('Jhansi', [
      StationEntry('Shivaji Nagar, Jhansi - UPPCB', 'shivaji-nagar-jhansi-uppcb'),
    ]),
    CityEntry('Kanpur', [
      StationEntry('FTI Kidwai Nagar, Kanpur - UPPCB', 'fti-kidwai-nagar-kanpur-uppcb'),
      StationEntry('IITK, Kanpur - IITK', 'iitk-kanpur-iitk'),
      StationEntry('NSI Kalyanpur, Kanpur - UPPCB', 'nsi-kalyanpur-kanpur-uppcb'),
      StationEntry('Nehru Nagar, Kanpur - UPPCB', 'nehru-nagar-kanpur-uppcb'),
    ]),
    CityEntry('Khora', [
      StationEntry('Prashant Garden, Khora - UPPCB', 'prashant-garden-khora-uppcb'),
    ]),
    CityEntry('Khurja', [
      StationEntry('Kalindi Kunj, Khurja - UPPCB', 'kalindi-kunj-khurja-uppcb'),
    ]),
    CityEntry('Lucknow', [
      StationEntry('B R Ambedkar University, Lucknow - UPPCB', 'b-r-ambedkar-university-lucknow-uppcb'),
      StationEntry('Gomti Nagar, Lucknow - UPPCB', 'gomti-nagar-lucknow-uppcb'),
      StationEntry('Kendriya Vidyalaya, Lucknow - CPCB', 'kendriya-vidyalaya-lucknow-cpcb'),
      StationEntry('Kukrail Picnic Spot-1, Lucknow - UPPCB', 'kukrail-picnic-spot-1-lucknow-uppcb'),
      StationEntry('Lalbagh, Lucknow - CPCB', 'lalbagh-lucknow-cpcb'),
      StationEntry('Talkatora District Industries Center, Lucknow - CPCB', 'talkatora-district-industries-center-lucknow-cpcb'),
    ]),
    CityEntry('Meerut', [
      StationEntry('Ganga Nagar, Meerut - UPPCB', 'ganga-nagar-meerut-uppcb'),
      StationEntry('Jai Bhim Nagar, Meerut - UPPCB', 'jai-bhim-nagar-meerut-uppcb'),
      StationEntry('Pallavpuram Phase 2, Meerut - UPPCB', 'pallavpuram-phase-2-meerut-uppcb'),
    ]),
    CityEntry('Modinagar', [
      StationEntry('SRM University, Modinagar - UPPCB', 'srm-university-modinagar-uppcb'),
    ]),
    CityEntry('Moradabad', [
      StationEntry('Buddhi Vihar, Moradabad - UPPCB', 'buddhi-vihar-moradabad-uppcb'),
      StationEntry('Eco Herbal Park, Moradabad - UPPCB', 'eco-herbal-park-moradabad-uppcb'),
      StationEntry('Employment Office, Moradabad - UPPCB', 'employment-office-moradabad-uppcb'),
      StationEntry('Jigar Colony, Moradabad - UPPCB', 'jigar-colony-moradabad-uppcb'),
      StationEntry('Kashiram Nagar, Moradabad - UPPCB', 'kashiram-nagar-moradabad-uppcb'),
      StationEntry('Lajpat Nagar, Moradabad - UPPCB', 'lajpat-nagar-moradabad-uppcb'),
      StationEntry('Transport Nagar, Moradabad - UPPCB', 'transport-nagar-moradabad-uppcb'),
    ]),
    CityEntry('Muzaffarnagar', [
      StationEntry('New Mandi, Muzaffarnagar - UPPCB', 'new-mandi-muzaffarnagar-uppcb'),
    ]),
    CityEntry('Noida', [
      StationEntry('Sector - 125, Noida - UPPCB', 'sector-125-noida-uppcb'),
      StationEntry('Sector - 62, Noida - IMD', 'sector-62-noida-imd'),
      StationEntry('Sector-1, Noida - UPPCB', 'sector-1-noida-uppcb'),
      StationEntry('Sector-116, Noida - UPPCB', 'sector-116-noida-uppcb'),
    ]),
    CityEntry('Prayagraj', [
      StationEntry('Jhunsi, Prayagraj - UPPCB', 'jhunsi-prayagraj-uppcb'),
      StationEntry('Motilal Nehru NIT, Prayagraj - UPPCB', 'motilal-nehru-nit-prayagraj-uppcb'),
      StationEntry('Nagar Nigam, Prayagraj - UPPCB', 'nagar-nigam-prayagraj-uppcb'),
    ]),
    CityEntry('Raebareli', [
      StationEntry('Indira Nagar, Raebareli - NTPC Unchahar', 'indira-nagar-raebareli-ntpc-unchahar'),
    ]),
    CityEntry('Varanasi', [
      StationEntry('Ardhali Bazar, Varanasi - UPPCB', 'ardhali-bazar-varanasi-uppcb'),
      StationEntry('Bhelupur, Varanasi - UPPCB', 'bhelupur-varanasi-uppcb'),
      StationEntry('IESD Banaras Hindu University, Varanasi - UPPCB', 'iesd-banaras-hindu-university-varanasi-uppcb'),
      StationEntry('Maldahiya, Varanasi - UPPCB', 'maldahiya-varanasi-uppcb'),
    ]),
    CityEntry('Vrindavan', [
      StationEntry('Omex Eternity, Vrindavan - UPPCB', 'omex-eternity-vrindavan-uppcb'),
    ]),
  ]),
  StateEntry('Uttarakhand', [
    CityEntry('Dehradun', [
      StationEntry('Doon University, Dehradun - UKPCB', 'doon-university-dehradun-ukpcb'),
    ]),
    CityEntry('Kashipur', [
      StationEntry('Govt. Girls Inter College, Kashipur - UKPCB', 'govt-girls-inter-college-kashipur-ukpcb'),
    ]),
    CityEntry('Rishikesh', [
      StationEntry('Shivaji Nagar, Rishikesh - UKPCB', 'shivaji-nagar-rishikesh-ukpcb'),
    ]),
  ]),
  StateEntry('West Bengal', [
    CityEntry('Asansol', [
      StationEntry('Asansol Court Area, Asansol - WBPCB', 'asansol-court-area-asansol-wbpcb'),
      StationEntry('Evelyn Lodge, Asansol - WBPCB', 'evelyn-lodge-asansol-wbpcb'),
      StationEntry('Mahabir Colliery, Asansol - WBPCB', 'mahabir-colliery-asansol-wbpcb'),
      StationEntry('Trivenidevi Bhalotia College, Asansol - WBPCB', 'trivenidevi-bhalotia-college-asansol-wbpcb'),
    ]),
    CityEntry('Barrackpore', [
      StationEntry('SVSPA Campus, Barrackpore - WBPCB', 'svspa-campus-barrackpore-wbpcb'),
    ]),
    CityEntry('Durgapur', [
      StationEntry('Mahishkapur Road_B-Zone, Durgapur - WBPCB', 'mahishkapur-road-b-zone-durgapur-wbpcb'),
      StationEntry('PCBL Residential Complex, Durgapur - WBPCB', 'pcbl-residential-complex-durgapur-wbpcb'),
      StationEntry('Womens College_City Center, Durgapur - WBPCB', 'womens-college-city-center-durgapur-wbpcb'),
    ]),
    CityEntry('Haldia', [
      StationEntry('Priyambada Housing Estate, Haldia - WBPCB', 'priyambada-housing-estate-haldia-wbpcb'),
    ]),
    CityEntry('Howrah', [
      StationEntry('Belur Math, Howrah - WBPCB', 'belur-math-howrah-wbpcb'),
      StationEntry('Botanical Garden, Howrah - WBPCB', 'botanical-garden-howrah-wbpcb'),
      StationEntry('Dasnagar, Howrah - WBPCB', 'dasnagar-howrah-wbpcb'),
      StationEntry('Ghusuri, Howrah - WBPCB', 'ghusuri-howrah-wbpcb'),
      StationEntry('Padmapukur, Howrah - WBPCB', 'padmapukur-howrah-wbpcb'),
    ]),
    CityEntry('Kolkata', [
      StationEntry('Ballygunge, Kolkata - WBPCB', 'ballygunge-kolkata-wbpcb'),
      StationEntry('Bidhannagar, Kolkata - WBPCB', 'bidhannagar-kolkata-wbpcb'),
      StationEntry('Fort William, Kolkata - WBPCB', 'fort-william-kolkata-wbpcb'),
      StationEntry('Jadavpur, Kolkata - WBPCB', 'jadavpur-kolkata-wbpcb'),
      StationEntry('Rabindra Bharati University, Kolkata - WBPCB', 'rabindra-bharati-university-kolkata-wbpcb'),
      StationEntry('Rabindra Sarobar, Kolkata - WBPCB', 'rabindra-sarobar-kolkata-wbpcb'),
      StationEntry('Victoria, Kolkata - WBPCB', 'victoria-kolkata-wbpcb'),
    ]),
    CityEntry('Siliguri', [
      StationEntry('Ward-32 Bapupara, Siliguri - WBPCB', 'ward-32-bapupara-siliguri-wbpcb'),
    ]),
  ]),
];
