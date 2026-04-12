# CarbonSense – Dataset and Emission Factor

# Documentation

## 1. Introduction

CarbonSense is a carbon footprint estimation system designed to help individuals
understand and reduce their environmental impact. The system estimates carbon
emissions generated through everyday activities such as electricity consumption and
transportation usage.

To ensure accuracy and contextual relevance, the project relies on **India-specific
emission factor datasets published by credible governmental and research
organizations**. The selected datasets provide standardized emission factors for
electricity generation, fuel combustion, and transportation activities within the Indian
context.

The dataset selection for CarbonSense follows three key criteria:

- **Relevance to the Indian environmental and energy ecosystem**
- **Credibility of the publishing organization**
- **Availability of publicly accessible and recognized emission factors**

These datasets are integrated into the system to convert user activity data (such as
electricity usage or fuel consumption) into estimated carbon dioxide (CO₂)
emissions.

## 2. Electricity Emission Factor Dataset

**Dataset: CO** ₂ **Baseline Database for the Indian Power Sector (Version 21)
Publisher:** Central Electricity Authority (CEA), Government of India

**Purpose in CarbonSense**

Electricity consumption is one of the primary contributors to household carbon
emissions. In India, electricity is generated through a mix of sources including coal,
natural gas, hydroelectric power, renewable energy, and nuclear power. The carbon
intensity of the electricity grid varies depending on this generation mix.

The **CO** ₂ **Baseline Database for the Indian Power Sector** provides the officially
calculated **grid emission factor for electricity generation in India**. CarbonSense
uses this emission factor to estimate emissions associated with household electricity
consumption.

**Emission Factor Used**

**0.716 kg CO** ₂ **per kWh**


This value represents the amount of carbon dioxide emitted per unit of electricity
generated and supplied through the national grid.

**Calculation Method**

Electricity emissions are calculated using the following formula:

Electricity Emissions (kg CO₂) = Electricity Consumption (kWh) × Grid Emission
Factor

This allows the system to convert user-reported electricity usage into an estimated
carbon footprint.

## 3. Petrol Emission Factor Dataset

**Dataset:** **_India Biennial Update Report (BUR-4) – National Greenhouse Gas
Inventory_**
**Publisher:** Government of India submission to the United Nations Framework
Convention on Climate Change (UNFCCC)

**Purpose in CarbonSense**

Petrol is widely used as a transportation fuel in India, particularly for **two-wheelers
and passenger vehicles**. The combustion of petrol releases carbon dioxide as a
byproduct of burning hydrocarbons.

The emission factor used in CarbonSense is derived from the **National Greenhouse
Gas Inventory presented in India’s Biennial Update Report**. This report provides
standardized emission factors used for national greenhouse gas accounting.

**Emission Factor Used**

**2.31 kg CO** ₂ **per litre of petrol**

**Calculation Method**

Petrol emissions are calculated using the formula:

Petrol Emissions (kg CO₂) = Fuel Consumed (litres) × Petrol Emission Factor

This method enables the system to estimate transportation emissions for petrol-
powered vehicles.


## 4. Diesel Emission Factor Dataset

**Dataset** : **Freight GHG Calculator Methodology Report
Publisher:** The Energy and Resources Institute (TERI)

**Purpose in CarbonSense**

Diesel is commonly used in:

- Commercial vehicles
- Freight transportation
- Buses
- Some passenger vehicles

Diesel combustion produces carbon dioxide emissions proportional to the quantity of
fuel burned.

The emission factor applied in CarbonSense is based on methodology developed for
greenhouse gas estimation in freight transport systems.

**Emission Factor Used**

**2.64 kg CO** ₂ **per litre of diesel**

**Calculation Method**

Diesel emissions are calculated using the following formula:

Diesel Emissions (kg CO₂) = Fuel Consumed (litres) × Diesel Emission Factor

This allows the system to estimate emissions from diesel-based transport activities.

## 5. Transport Emission Methodology Dataset

**Dataset: India Specific Road Transport Emission Factors
Publisher:** World Resources Institute (WRI) – India GHG Program

**Purpose in CarbonSense**

Many users may not know the exact fuel consumption of their vehicles. Instead, they
may provide information such as **distance traveled** or **mode of transportation**.

To handle this scenario, CarbonSense incorporates methodology from **India-
specific road transport emission studies** to estimate emissions based on vehicle
type and distance travelled.

This dataset provides guidance for estimating emissions associated with different
transportation modes, including:

- Two-wheelers


- Passenger cars
- Buses
- Public transport systems

These parameters allow the system to convert **distance-based travel data into
estimated emissions**.

**6. Air Quality Data Source**

**API Source: OpenAQ API**

**Purpose in CarbonSense**

In addition to carbon footprint estimation, CarbonSense includes an environmental
awareness component by displaying **real-time air quality information**.

The OpenAQ platform aggregates air quality data from monitoring stations
worldwide, including multiple cities in India.

The application uses this API to retrieve environmental indicators such as:

- Air Quality Index (AQI)
- PM2.
- PM
- Nitrogen dioxide (NO₂)
- Sulfur dioxide (SO₂)
- Carbon monoxide (CO)

This data is displayed in the application dashboard to provide users with contextual
information about environmental conditions in their city.

It is important to note that **air quality data is used only for informational
purposes and is not directly involved in the carbon emission calculation
process**.


**7. Summary of Emission Factors Used**

```
Emission
Source
```
```
Emission Factor Dataset Source
```
```
Electricity 0.716 kg CO₂ per kWh CEA CO₂ Baseline Database (Version
21)
Petrol 2.31 kg CO₂ per litre India BUR-4 National GHG Inventory
```
```
Diesel 2.64 kg CO₂ per litre TERI Freight GHG Methodology
```
```
Transport
Modes
```
```
Derived per-km
estimates
```
```
WRI India Road Transport Emission
Factors
```