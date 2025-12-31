# Real Estate Analysis Methodology - AI Agent Framework
**Universal Methodology for ALL Real Estate Transactions**

**Last Updated**: December 28, 2025  
**Status**: AI Agent Core Methodology - Flexible Parameters

---

## 🤖 **AI AGENT PARAMETER FRAMEWORK**

### 📋 **REQUIRED USER INPUTS** (Must be gathered at start of analysis)

#### **Financial Parameters**
```json
{
  "availableBudget": {
    "amount": 0,
    "currency": "USD",
    "description": "Total cash available for transaction (closing + down payment)"
  },
  "interestRate": {
    "primary": 0.0,
    "investment": 0.0,
    "source": "user_provided | market_current",
    "dateUpdated": "YYYY-MM-DD"
  },
  "downPaymentStrategy": {
    "primary": "budget_based | percentage_based",
    "primaryPercentage": 0.0,
    "investment": "percentage_based",
    "investmentPercentage": 0.25
  },
  "monthlyBudgetLimit": {
    "primary": 0,
    "investment": "break_even | positive_cashflow"
  }
}
```

#### **Property Requirements**
```json
{
  "primaryResidence": {
    "minimumLotSize": 0.0,
    "minimumBedrooms": 0,
    "minimumBathrooms": 0,
    "requiredFeatures": ["pool", "garage", "casita"],
    "preferredFeatures": ["mountain_views", "no_hoa"],
    "maxCommute": 0,
    "targetAreas": []
  },
  "investment": {
    "propertyTypes": ["single_family", "townhome", "condo"],
    "minimumBedrooms": 0,
    "minimumBathrooms": 0,
    "targetCashFlow": 0,
    "targetCapRate": 0.0,
    "targetCashOnCash": 0.0,
    "managementStrategy": "self | professional"
  }
}
```

#### **Market Context**
```json
{
  "targetMarket": {
    "primaryCity": "",
    "primaryState": "",
    "radius": 0,
    "targetNeighborhoods": []
  },
  "analysisDate": "YYYY-MM-DD",
  "marketConditions": "buyers | sellers | balanced"
}
```

---

## 🏠 **PRIMARY RESIDENCE ANALYSIS ENGINE**

### **Dynamic Financial Calculation**

```python
def calculatePrimaryResidenceAffordability(property_price, user_params):
    """
    Calculate affordability based on user's specific financial parameters
    """
    budget = user_params['availableBudget']['amount']
    interest_rate = user_params['interestRate']['primary']
    monthly_limit = user_params['monthlyBudgetLimit']['primary']
    
    # Calculate closing costs (1-2% of purchase price)
    closing_costs = property_price * 0.015  # Default 1.5%, should be market-specific
    
    # Determine down payment strategy
    if user_params['downPaymentStrategy']['primary'] == 'budget_based':
        net_down_payment = budget - closing_costs
        if net_down_payment <= 0:
            return {"affordable": False, "reason": "Budget insufficient for closing costs"}
    else:
        down_percentage = user_params['downPaymentStrategy']['primaryPercentage']
        net_down_payment = property_price * down_percentage
        total_cash_needed = net_down_payment + closing_costs
        if total_cash_needed > budget:
            return {"affordable": False, "reason": "Insufficient cash for down payment + closing"}
    
    # Calculate mortgage and monthly payment
    mortgage_amount = property_price - net_down_payment
    monthly_pi = calculateMonthlyPayment(mortgage_amount, interest_rate, 360)
    
    # Add property taxes, insurance, HOA (these should be property-specific)
    property_taxes_monthly = getPropertyTaxes(property_price, user_params['targetMarket'])
    insurance_monthly = getInsuranceEstimate(property_price, user_params['targetMarket'])
    hoa_monthly = getHOAFees(property_listing)
    
    total_monthly = monthly_pi + property_taxes_monthly + insurance_monthly + hoa_monthly
    
    return {
        "affordable": total_monthly <= monthly_limit,
        "monthlyPayment": total_monthly,
        "downPayment": net_down_payment,
        "closingCosts": closing_costs,
        "totalCashNeeded": net_down_payment + closing_costs,
        "mortgageAmount": mortgage_amount
    }
```

### **Dynamic Requirements Scoring**

```python
def scorePrimaryResidence(property_listing, user_requirements):
    """
    Score property based on user's specific requirements
    """
    score = 0
    max_score = 100
    
    # Lot size requirement (user-defined)
    min_lot_size = user_requirements['minimumLotSize']
    if property_listing['lot_size'] >= min_lot_size:
        score += 20
    elif property_listing['lot_size'] >= min_lot_size * 0.8:
        score += 15
    # ... continue with user-defined requirements
    
    return score
```

---

## 🏢 **INVESTMENT PROPERTY ANALYSIS ENGINE**

### **Dynamic Investment Calculation**

```python
def calculateInvestmentReturn(property_price, user_params, market_data):
    """
    Calculate investment returns based on user's parameters and current market
    """
    down_percentage = user_params['downPaymentStrategy']['investmentPercentage']
    interest_rate = user_params['interestRate']['investment']
    
    down_payment = property_price * down_percentage
    mortgage_amount = property_price - down_payment
    
    # Get market rental rates (should be API call or market research)
    estimated_rent = getMarketRent(property_listing, market_data)
    
    # Calculate all expenses
    monthly_pi = calculateMonthlyPayment(mortgage_amount, interest_rate, 360)
    property_taxes = getPropertyTaxes(property_price, market_data['location'])
    insurance = getInsuranceEstimate(property_price, market_data['location'])
    hoa = getHOAFees(property_listing)
    
    # Management strategy affects costs
    if user_params['investment']['managementStrategy'] == 'professional':
        management_fee = estimated_rent * 0.10  # 10% typical
    else:
        management_fee = 0
    
    total_expenses = monthly_pi + property_taxes + insurance + hoa + management_fee
    monthly_cashflow = estimated_rent - total_expenses
    
    return {
        "monthlyCashflow": monthly_cashflow,
        "annualCashflow": monthly_cashflow * 12,
        "cashOnCashReturn": (monthly_cashflow * 12) / down_payment,
        "capRate": ((estimated_rent * 12) - (total_expenses * 12)) / property_price,
        "meetsTargets": {
            "cashflow": monthly_cashflow >= user_params['investment']['targetCashFlow'],
            "capRate": ((estimated_rent * 12) - (total_expenses * 12)) / property_price >= user_params['investment']['targetCapRate'],
            "cashOnCash": ((monthly_cashflow * 12) / down_payment) >= user_params['investment']['targetCashOnCash']
        }
    }
```

---

## 📊 **MARKET DATA INTEGRATION POINTS**

### **Required API Integrations**
```python
def getCurrentMarketData(location):
    """
    Gather current market data from reliable sources
    """
    return {
        "interestRates": getCurrentInterestRates(),  # API call to financial data
        "propertyTaxRates": getTaxRates(location),   # Local tax authority API
        "rentalRates": getRentalComps(location),     # Rental platform APIs
        "insuranceRates": getInsuranceRates(location), # Insurance API
        "marketTrends": getMarketTrends(location)    # Real estate data APIs
    }
```

### **Dynamic Data Sources**
- **Interest Rates**: Federal Reserve, mortgage lenders APIs
- **Property Taxes**: County assessor APIs
- **Rental Rates**: Rentometer, RentBerry, Zillow Rental APIs  
- **Insurance**: Insurance company APIs
- **Market Trends**: Zillow, Realtor.com, RedFin APIs

---

## 🔧 **AI AGENT INTERACTION PROTOCOL**

### **Session Initialization**
```
1. Gather user financial parameters (budget, rates, strategy)
2. Define property requirements (size, features, location)
3. Set investment criteria (cashflow targets, management style)
4. Collect market context (location, timing, conditions)
5. Validate all parameters before analysis begins
```

### **Analysis Workflow**
```
1. Validate property listing data
2. Calculate affordability using user's parameters
3. Score property against user's requirements
4. Generate financial projections with user's rates
5. Compare against user's targets and limits
6. Provide recommendation with reasoning
```

### **Flexible Output Format**
```json
{
  "propertyAddress": "",
  "analysisDate": "",
  "userParameters": { /* echo back user inputs */ },
  "financialAnalysis": {
    "totalCashRequired": 0,
    "monthlyPayment": 0,
    "affordabilityVerdict": "affordable | unaffordable",
    "reasoning": ""
  },
  "requirementsScore": {
    "score": 0,
    "maxScore": 100,
    "breakdown": {}
  },
  "recommendation": {
    "verdict": "recommend | consider | pass",
    "reasoning": "",
    "riskFactors": [],
    "opportunities": []
  }
}
```

---

## ✅ **VALIDATION CHECKPOINTS**

### **Before Analysis**
- [ ] All user parameters collected and validated
- [ ] Current market data retrieved and verified  
- [ ] Property listing data validated and complete
- [ ] User requirements clearly defined

### **During Analysis** 
- [ ] Financial calculations use user's specific parameters
- [ ] No hard-coded values in calculations
- [ ] All rates and costs from current market data
- [ ] Scoring based on user's specific requirements

### **After Analysis**
- [ ] Results match user's criteria and constraints
- [ ] Recommendations align with user's strategy  
- [ ] All calculations auditable and reproducible
- [ ] Output format consistent and complete

---

**This framework ensures the AI Agent can flexibly analyze ANY real estate transaction using the user's specific parameters and current market conditions, rather than hard-coded assumptions.**
