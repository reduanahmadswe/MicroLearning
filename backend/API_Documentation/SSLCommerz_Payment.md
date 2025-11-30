# SSLCommerz Payment Integration - API Documentation

## Overview (সারসংক্ষেপ)

এই API marketplace এ SSLCommerz payment gateway ব্যবহার করে item purchase করার জন্য। এটি Bangladesh এর সবচেয়ে জনপ্রিয় payment gateway যা bKash, Nagad, Rocket, Credit Card, Debit Card সহ ১৫+ payment method সাপোর্ট করে।

**Key Features:**
- ✅ Multiple Payment Methods (bKash, Nagad, Rocket, Card, etc.)
- ✅ Secure Payment Gateway
- ✅ Real-time Payment Validation
- ✅ Automatic Refund Support
- ✅ IPN (Instant Payment Notification)
- ✅ Test & Live Mode
- ✅ Transaction Tracking

---

## Environment Variables (এনভায়রনমেন্ট ভেরিয়েবল)

`.env` ফাইলে এই configuration গুলো add করতে হবে:

```env
# SSLCommerz Payment Gateway
SSLCOMMERZ_STORE_ID=your_store_id_here
SSLCOMMERZ_STORE_PASSWORD=your_store_password_here
SSLCOMMERZ_IS_LIVE=false
BACKEND_URL=http://localhost:5000
FRONTEND_URL=http://localhost:3000
```

**কিভাবে SSLCommerz Credentials পাবেন:**
1. https://developer.sslcommerz.com/ এ গিয়ে Register করুন
2. Sandbox/Test Store credentials পাবেন
3. Live deployment এর জন্য Production store apply করতে হবে

---

## API Endpoints

### 1. Create Purchase (পেমেন্ট শুরু করুন)

**POST** `/api/marketplace/purchases`

একটি marketplace item কিনতে এবং SSLCommerz payment শুরু করতে এই endpoint ব্যবহার করুন।

**Headers:**
```
Authorization: Bearer <access_token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "itemId": "673abc123def456789012345",
  "paymentMethod": "sslcommerz"
}
```

**Response (Success - 201):**
```json
{
  "success": true,
  "message": "Purchase initialized successfully. Please complete payment.",
  "data": {
    "purchase": {
      "_id": "673xyz789abc123456789012",
      "buyer": "673user123abc456789012345",
      "item": {
        "_id": "673abc123def456789012345",
        "title": "Complete JavaScript Course",
        "price": 999,
        "currency": "BDT"
      },
      "amount": 799,
      "currency": "BDT",
      "paymentMethod": "sslcommerz",
      "paymentStatus": "pending",
      "createdAt": "2024-11-30T10:30:00.000Z"
    },
    "paymentUrl": "https://sandbox.sslcommerz.com/gwprocess/v4/gw.php?Q=PAY&SESSIONKEY=xxxxx"
  }
}
```

**Usage:**
User কে `paymentUrl` এ redirect করুন যেখানে SSLCommerz payment page open হবে।

---

### 2. Payment Success Callback

**POST** `/api/marketplace/payment/success?tran_id=<purchase_id>`

SSLCommerz থেকে payment সফল হলে এই endpoint call হয়। Automatically frontend এ redirect করে।

**Redirect:**
```
Frontend URL: http://localhost:3000/payment/success?purchase=<purchase_id>
```

---

### 3. Payment Fail Callback

**POST** `/api/marketplace/payment/fail?tran_id=<purchase_id>`

Payment fail হলে এই endpoint call হয়।

**Redirect:**
```
Frontend URL: http://localhost:3000/payment/failed
```

---

### 4. Payment Cancel Callback

**POST** `/api/marketplace/payment/cancel?tran_id=<purchase_id>`

User payment cancel করলে এই endpoint call হয়।

**Redirect:**
```
Frontend URL: http://localhost:3000/payment/cancelled
```

---

### 5. Payment IPN (Instant Payment Notification)

**POST** `/api/marketplace/payment/ipn`

SSLCommerz server-to-server notification পাঠায় payment verification এর জন্য।

**Response:**
```json
{
  "success": true,
  "message": "Payment validated successfully",
  "data": null
}
```

---

## Payment Flow (পেমেন্ট ফ্লো)

```
1. User clicks "Buy Now" button
   ↓
2. Frontend POST /api/marketplace/purchases
   ↓
3. Backend creates purchase (status: pending)
   ↓
4. Backend initializes SSLCommerz payment
   ↓
5. Backend returns paymentUrl
   ↓
6. Frontend redirects to paymentUrl
   ↓
7. User completes payment on SSLCommerz page
   ↓
8. SSLCommerz redirects back to success/fail/cancel URL
   ↓
9. Backend validates payment
   ↓
10. Backend updates purchase status (completed/failed)
   ↓
11. Backend updates item salesCount & revenue
   ↓
12. Redirect to frontend success/fail page
```

---

## Frontend Integration Example

### React.js Example

```jsx
import { useState } from 'react';
import axios from 'axios';

const PurchaseButton = ({ itemId }) => {
  const [loading, setLoading] = useState(false);

  const handlePurchase = async () => {
    try {
      setLoading(true);
      
      const response = await axios.post(
        '/api/marketplace/purchases',
        {
          itemId: itemId,
          paymentMethod: 'sslcommerz'
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        }
      );

      // Redirect to SSLCommerz payment page
      if (response.data.data.paymentUrl) {
        window.location.href = response.data.data.paymentUrl;
      }
    } catch (error) {
      console.error('Purchase failed:', error);
      alert('Payment initialization failed!');
    } finally {
      setLoading(false);
    }
  };

  return (
    <button 
      onClick={handlePurchase}
      disabled={loading}
      className="bg-green-600 text-white px-6 py-3 rounded-lg"
    >
      {loading ? 'Processing...' : 'Buy Now - ৳999'}
    </button>
  );
};

export default PurchaseButton;
```

### Payment Success Page

```jsx
// pages/payment/success.jsx
import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';

const PaymentSuccess = () => {
  const [searchParams] = useSearchParams();
  const purchaseId = searchParams.get('purchase');
  
  useEffect(() => {
    // Fetch purchase details if needed
    // Show success message
  }, [purchaseId]);

  return (
    <div className="text-center py-20">
      <div className="text-6xl mb-4">✅</div>
      <h1 className="text-3xl font-bold mb-4">Payment Successful!</h1>
      <p className="text-gray-600 mb-8">
        Your purchase has been completed successfully.
      </p>
      <a href="/my-courses" className="bg-blue-600 text-white px-6 py-3 rounded-lg">
        Go to My Courses
      </a>
    </div>
  );
};

export default PaymentSuccess;
```

---

## Payment Methods Supported

SSLCommerz এর মাধ্যমে এই payment methods গুলো support করে:

| Method | Logo | Description |
|--------|------|-------------|
| **bKash** | <img src="https://www.logo.wine/a/logo/BKash/BKash-Icon-Logo.wine.svg" width="50"> | Bangladesh এর #1 mobile banking |
| **Nagad** | 💰 | Digital wallet |
| **Rocket** | 🚀 | Dutch-Bangla Bank mobile banking |
| **Visa Card** | 💳 | International credit/debit card |
| **Mastercard** | 💳 | International credit/debit card |
| **American Express** | 💳 | International credit card |
| **Internet Banking** | 🏦 | Direct bank payment |

---

## Testing Credentials

### Sandbox/Test Mode

**Test Card Numbers:**
```
Card Number: 4111 1111 1111 1111
Expiry: Any future date (e.g., 12/25)
CVV: Any 3 digits (e.g., 123)
```

**Test bKash:**
```
Mobile: 01XXXXXXXXX (any number)
OTP: Any 4 digits
```

---

## Payment Validation

Backend automatically validates payment using SSLCommerz Validation API:

```typescript
// Example validation response
{
  status: 'VALID' | 'VALIDATED' | 'INVALID',
  tran_id: '673xyz789abc123456789012',
  amount: '799.00',
  currency: 'BDT',
  bank_tran_id: 'ABC123456789',
  card_type: 'VISA-Dutch Bangla',
  risk_level: '0',
  risk_title: 'Safe'
}
```

---

## Security Features

### 1. Payment Validation
প্রতিটি payment SSLCommerz API দিয়ে validate করা হয়।

### 2. Transaction Tracking
প্রতিটি transaction এর unique `tran_id` থাকে।

### 3. IPN (Instant Payment Notification)
Server-to-server notification দিয়ে payment verify করা হয়।

### 4. Amount Verification
Frontend থেকে amount না নিয়ে backend থেকে calculate করা হয়।

---

## Error Handling

### Common Errors:

**1. SSLCommerz credentials not configured**
```json
{
  "success": false,
  "message": "SSLCommerz credentials not configured"
}
```
**Solution:** `.env` ফাইলে credentials add করুন।

**2. Payment initialization failed**
```json
{
  "success": false,
  "message": "Payment initialization failed"
}
```
**Solution:** SSLCommerz credentials check করুন বা sandbox mode enable করুন।

**3. Item already purchased**
```json
{
  "success": false,
  "message": "You have already purchased this item"
}
```

---

## Refund Process

### Initiate Refund (ম্যানুয়াল)

Refund এর জন্য SSLCommerz dashboard ব্যবহার করতে হবে অথবা Refund API call করতে হবে।

```typescript
// Future implementation
const initiateRefund = async (purchaseId: string, refundReason: string) => {
  // Call SSLCommerz Refund API
  // Update purchase status to 'refunded'
};
```

---

## Webhooks Configuration

SSLCommerz Dashboard এ এই URLs configure করুন:

```
Success URL: https://yourdomain.com/api/marketplace/payment/success
Fail URL: https://yourdomain.com/api/marketplace/payment/fail
Cancel URL: https://yourdomain.com/api/marketplace/payment/cancel
IPN URL: https://yourdomain.com/api/marketplace/payment/ipn
```

---

## Migration from Other Payment Gateways

অন্য payment gateway থেকে SSLCommerz এ migrate করতে চাইলে:

1. ✅ Old payment methods (stripe, bkash, paypal) remove করা হয়েছে
2. ✅ শুধুমাত্র `sslcommerz` payment method রাখা হয়েছে
3. ✅ Payment flow completely updated
4. ✅ Callback URLs configured

---

## Testing Checklist

### ✅ Before Going Live:

- [ ] Test payment with test credentials
- [ ] Test success flow
- [ ] Test fail flow
- [ ] Test cancel flow
- [ ] Verify IPN working
- [ ] Test refund process
- [ ] Update to live credentials
- [ ] Test with real card (small amount)

---

## Support & Resources

### SSLCommerz Documentation:
- Developer Portal: https://developer.sslcommerz.com/
- API Documentation: https://developer.sslcommerz.com/doc/v4/
- Integration Guide: https://developer.sslcommerz.com/integration/

### Common Issues:
1. **Payment page not loading**: Check credentials
2. **Success callback not working**: Verify callback URLs
3. **Amount mismatch**: Check currency conversion

---

## FAQ (সচরাচর জিজ্ঞাসা)

**Q: SSLCommerz কি free?**
A: Test mode free। Live mode এ per transaction charge আছে।

**Q: কোন payment methods available?**
A: bKash, Nagad, Rocket, All major cards, Internet banking

**Q: Production এ যেতে কি লাগবে?**
A: Trade license, Bank account, Company documents

**Q: Transaction limit কত?**
A: Depends on account type (Test: ৳10,000, Standard: ৳50,000+)

---

## Conclusion

SSLCommerz integration সম্পন্ন! এখন আপনার marketplace এ secure payment accept করতে পারবেন। 🎉

**Next Steps:**
1. `.env` file এ credentials add করুন
2. Test mode এ payment test করুন
3. Frontend integration complete করুন
4. Live mode apply করুন

---

**Last Updated:** November 30, 2024
**Version:** 1.0.0
**Maintained by:** MicroLearning Team
