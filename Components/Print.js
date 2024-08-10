import * as Print from 'expo-print';
import { shareAsync } from 'expo-sharing';

export const printReceipt = async (orderDetails, selectedPrinter) => {
  const html = `
    <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0, user-scalable=no" />
        <style>
          body { font-family: Arial, sans-serif; text-align: center; }
          h1 { font-size: 24px; }
          table { width: 90%; margin: 20px 0; justify-self: center; align-self: center; }
          th, td { border: none; padding: 8px; text-align: left; }
        </style>
      </head>
      <body>
        <h1>Order Receipt</h1>
        <div style="width: 100%; height: auto; margin-left: 2%;">
          <table>
            <tr>
              <th>Item</th>
              <th style="text-align: right;">Quantity</th>
              <th style="text-align: right;">Price</th>
            </tr>
            ${orderDetails.items.map(item => `
              <tr>
                <td>${item.newItemName}</td>
                <td  style="text-align: right;">${item.quantity}</td>
                <td style="text-align: right;">${(item.newItemPrice * item.quantity).toFixed(2)}</td>
              </tr>
            `).join('')}
          </table>
          
            <h1 style="margin-left:">............................................................................................................</h1>
            <div style="width: 90%;  ">
            <div style="display: flex; justify-content: space-between; width: 100%; ">
              <p>Subtotal</p>
              <p>P ${orderDetails.subtotal.toFixed(2)}</p>
            </div>
            <div style="display: flex; justify-content: space-between; width: 100%; ">
              <p>Tax</p>
              <p>${orderDetails.tax.toFixed(2)}%</p>
            </div>
            <div style="display: flex; justify-content: space-between; width: 100%; ">
              <p>Discount</p>
              <p>${orderDetails.discount.toFixed(2)}%</p>
            </div>
            <div style="display: flex; justify-content: space-between; width: 100%;">
              <p>Total</p>
              <p>P ${orderDetails.total.toFixed(2)}</p>
            </div>
            <div style="display: flex; justify-content: space-between; width: 100%; ;">
              <p>Change</p>
              <p>P ${orderDetails.change.toFixed(2)}</p>
            </div>
            <div style="display: flex; justify-content: space-between; width: 100%; ">
              <p>Order Type</p>
              <p>${orderDetails.orderType}</p>
            </div>
            ${orderDetails.table ? `
              <div style="display: flex; justify-content: space-between; width: 100%;">
                <p>Table</p>
                <p>${orderDetails.table}</p>
              </div>
            ` : ''}
          </div>
            <p>Timestamp: ${new Date(orderDetails.timestamp).toLocaleString()}</p>
        </div>
      </body>
    </html>
  `;

  await Print.printAsync({
    html,
    printerUrl: selectedPrinter?.url, // iOS only
  });
};

export const selectPrinter = async (setSelectedPrinter) => {
  const printer = await Print.selectPrinterAsync(); // iOS only
  setSelectedPrinter(printer);
};
