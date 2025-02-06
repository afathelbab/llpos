"use client";

import React, { useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";

const devices = {
  "Dobbelt Screen": { cost: 3800, price: 8000 },
  "Single Screen": { cost: 3400, price: 6500 },
  "M20": { cost: 1400, price: 2500 },
  "Pengeskuffe": { cost: 330, price: 1000 },
};

const roundUpToNearest50 = (amount) => Math.ceil(amount / 50) * 50;

const revenueClasses = [
  { name: "Nova", min: 0, max: 400000, baseCommission: 250 },
  { name: "Vega", min: 400001, max: 800000, baseCommission: 500 },
  { name: "Zen", min: 800001, max: 1200000, baseCommission: 1000 },
  { name: "Alfa", min: 1200001, max: 6000000, baseCommission: 2000 },
];

export default function SalesApp() {
  const [selectedDevices, setSelectedDevices] = useState({});
  const [downPayment, setDownPayment] = useState(1000);
  const [installment, setInstallment] = useState(null);
  const [paymentOption, setPaymentOption] = useState("");
  const [fullPurchasePrice, setFullPurchasePrice] = useState(null);
  const [monthlyRevenue, setMonthlyRevenue] = useState("");
  const [modifiedRevenue, setModifiedRevenue] = useState(null);
  const [annualRevenue, setAnnualRevenue] = useState(null);
  const [revenueCategory, setRevenueCategory] = useState("");
  const [commission, setCommission] = useState(null);

  const updateQuantity = (device, quantity) => {
    const validQuantity = Math.max(0, Math.floor(quantity));
    setSelectedDevices((prev) => ({
      ...prev,
      [device]: validQuantity > 0 ? validQuantity : undefined,
    }));
  };

  const calculateTotalPrice = () => {
    return Object.entries(selectedDevices).reduce((total, [device, quantity]) => {
      if (quantity) {
        total += devices[device].price * quantity;
      }
      return total;
    }, 0);
  };

  const calculateInstallment = (withDownPayment) => {
    const totalPrice = calculateTotalPrice();
    if (totalPrice === 0) return;

    const financingPrice = withDownPayment ? totalPrice * 1.35 : totalPrice * 1.45;
    const paymentToFinance = withDownPayment ? financingPrice - downPayment : financingPrice;
    const monthlyInstallment = roundUpToNearest50(paymentToFinance / 24);

    setInstallment(monthlyInstallment);
    setFullPurchasePrice(null);
    setPaymentOption(withDownPayment ? "With Down Payment" : "Without Down Payment");
  };

  const showFullPurchasePrice = () => {
    const totalPrice = calculateTotalPrice();
    if (totalPrice === 0) return;

    setFullPurchasePrice(totalPrice);
    setInstallment(null);
    setPaymentOption("Purchasing Model");
  };

  const evaluateRevenueCategory = () => {
    const modified = parseFloat(monthlyRevenue) * 0.8;
    const annual = modified * 12;
    setModifiedRevenue(modified);
    setAnnualRevenue(annual);
    
    const category = revenueClasses.find((cls) => modified >= cls.min && modified <= cls.max);
    if (category) {
      setRevenueCategory(category.name);
      
      // Calculate commission based on position within range
      const position = (modified - category.min) / (category.max - category.min);
      const calculatedCommission = category.baseCommission + (position * category.baseCommission);
      setCommission(calculatedCommission.toFixed(2));
    } else {
      setRevenueCategory("Outside Range");
      setCommission(null);
    }
  };


  return (
    <div className="container my-5">
      <div className="row">
        {/* Left Side: Sales Calculator */}
        <div className="col-lg-6">
          <div className="p-4 bg-white rounded shadow-lg">
            <div className="mb-3 text-center">
              <img src="/logo.png" alt="Company Logo" className="img-fluid" style={{ maxHeight: '80px' }} />
            </div>
            <h2 className="text-primary text-center mb-4">LLPOS Hardware Sales</h2>

            <div className="mb-4">
              <h5 className="text-dark">Select Devices and Quantities</h5>
              {Object.keys(devices).map((device) => (
                <div key={device} className="d-flex justify-content-between align-items-center border p-2 rounded bg-light my-2">
                  <span className="fw-bold text-dark">{device}</span>
                  <input
                    type="number"
                    className="form-control w-25"
                    min={0}
                    placeholder="0"
                    value={selectedDevices[device] || ""}
                    onChange={(e) => updateQuantity(device, Number(e.target.value))}
                  />
                </div>
              ))}
            </div>

            <div className="mb-4">
              <label className="fw-bold text-dark">Down Payment (Minimum 1000 DKK)</label>
              <input
                type="text"
                className="form-control"
                value={downPayment}
                placeholder="1000"
                onChange={(e) => {
                  const value = e.target.value;
                  if (/^\d*$/.test(value)) {
                    setDownPayment(value === "" ? 1000 : Number(value));
                  }
                }}
                onBlur={(e) => {
                  if (Number(e.target.value) < 1000 || isNaN(Number(e.target.value))) {
                    setDownPayment(1000);
                  }
                }}
              />
            </div>

            <div className="d-grid gap-2">
              <button className="btn btn-primary" onClick={() => calculateInstallment(true)}>Finance with Down Payment</button>
              <button className="btn btn-success" onClick={() => calculateInstallment(false)}>Finance without Down Payment</button>
              <button className="btn btn-warning" onClick={showFullPurchasePrice}>Pay Full Amount (Purchasing Model)</button>
            </div>

            {paymentOption && (
              <div className="mt-3 p-3 border rounded bg-light text-center">
                {paymentOption === "Purchasing Model" ? (
                  <h4 className="text-success">Total Price: {fullPurchasePrice} DKK</h4>
                ) : (
                  <h4 className="text-danger">Monthly Installment: {installment} DKK</h4>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Right Side: Revenue Evaluation */}
        <div className="col-lg-6">
          <div className="p-4 bg-light rounded shadow-lg">
            <h3 className="text-secondary text-center">Revenue Evaluation</h3>
            <label className="fw-bold text-dark">Enter Monthly Revenue (DKK)</label>
            <input type="number" className="form-control mb-2" value={monthlyRevenue} 
              onChange={(e) => setMonthlyRevenue(e.target.value)}               
            />
            <button className="btn btn-info w-100" onClick={evaluateRevenueCategory}>Evaluate</button>
            {modifiedRevenue && (
              <div className="mt-3 p-3 border rounded bg-white text-center">
                <p><strong>Modified Monthly Revenue:</strong> {modifiedRevenue.toLocaleString()} DKK</p>
                <p><strong>Annual Revenue:</strong> {annualRevenue.toLocaleString()} DKK</p>
                <p><strong>Category:</strong> {revenueCategory}</p>
                {commission && <p><strong>Agent Commission:</strong> {commission} DKK</p>}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
