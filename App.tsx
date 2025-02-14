import { StyleSheet, Alert, View } from "react-native";

import {
  Address,
  BillingDetails,
  StripeProvider,
} from "@stripe/stripe-react-native";

import { useStripe } from "@stripe/stripe-react-native";
import { pk } from "./utils/stripe";
import { useState } from "react";
import { API_URL } from "./utils/api";
import Button from "./components/Button";
import PaymentScreen from "./components/PaymentScreen";
import { colors } from "./components/colors";

function App() {
  return (
    <StripeProvider
      publishableKey={pk}
      merchantIdentifier="merchant.identifier" // required for Apple Pay
      urlScheme="your-url-scheme" // required for 3D Secure and bank redirects
    >
      <Screen />
    </StripeProvider>
  );
}

export default function Screen() {
  const { confirmPayment } = useStripe();

  const { initPaymentSheet, presentPaymentSheet, confirmPaymentSheetPayment } =
    useStripe();

  const [paymentSheetEnabled, setPaymentSheetEnabled] = useState(false);
  const [loading, setLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<{
    image: string;
    label: string;
  } | null>(null);

  const fetchPaymentSheetParams = async () => {
    const response = await fetch(`${API_URL}/payment-sheet`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    });
    const { paymentIntent, ephemeralKey, customer } = await response.json();

    return {
      paymentIntent,
      ephemeralKey,
      customer,
    };
  };

  const initialisePaymentSheet = async () => {
    setLoading(true);

    try {
      const { paymentIntent } = await fetchPaymentSheetParams();

      const address: Address = {
        city: "San Francisco",
        country: "AT",
        line1: "510 Townsend St.",
        line2: "123 Street",
        postalCode: "94102",
        state: "California",
      };
      const billingDetails: BillingDetails = {
        name: "Jane Doe",
        email: "foo@bar.com",
        phone: "555-555-555",
        address: address,
      };

      const { error, paymentOption } = await initPaymentSheet({
        paymentIntentClientSecret: paymentIntent,
        customFlow: true,
        merchantDisplayName: "Example Inc.",
        style: "automatic",
        googlePay: { merchantCountryCode: "US", testEnv: true },
        returnURL: "stripe-example://stripe-redirect",
        defaultBillingDetails: billingDetails,
      });

      if (!error) {
        setPaymentSheetEnabled(true);
      } else {
        Alert.alert(`Error code: ${error.code}`, error.message);
      }
      if (paymentOption) {
        setPaymentMethod(paymentOption);
      }
    } catch (error) {
      console.log("error", error);
    } finally {
      setLoading(false);
    }
  };

  const choosePaymentOption = async () => {
    const { error, paymentOption } = await presentPaymentSheet();

    if (error) {
      Alert.alert(`Error code: ${error.code}`, error.message);
    } else if (paymentOption) {
      setPaymentMethod({
        label: paymentOption.label,
        image: paymentOption.image,
      });
    } else {
      setPaymentMethod(null);
    }
  };

  const onPressBuy = async () => {
    setLoading(true);
    const { error } = await confirmPaymentSheetPayment();

    if (error) {
      Alert.alert(`Error code: ${error.code}`, error.message);
    } else {
      Alert.alert("Success", "The payment was confirmed successfully!");
      setPaymentSheetEnabled(false);
    }
    setLoading(false);
  };

  return (
    // In your app’s checkout, make a network request to the backend and initialize PaymentSheet.
    // To reduce loading time, make this request before the Checkout button is tapped, e.g. when the screen is loaded.
    <PaymentScreen onInit={initialisePaymentSheet}>
      <View
        style={{
          padding: 60,
        }}
      >
        <Button
          variant="primary"
          loading={loading}
          title={"Choose payment method"}
          disabled={!paymentSheetEnabled}
          onPress={choosePaymentOption}
        />
        <Button
          variant="primary"
          loading={loading}
          title={"Trigger timeout"}
          disabled={!paymentSheetEnabled}
          onPress={async () => {
            setLoading(true);
            const { error } = await presentPaymentSheet({ timeout: 5000 });
            if (error) {
              Alert.alert(`${error.code}`, error.message);
            }
            setLoading(false);
          }}
        />
      </View>

      <View style={styles.section}>
        <Button
          variant="primary"
          loading={loading}
          disabled={!paymentMethod || !paymentSheetEnabled}
          title={`Buy${paymentMethod ? ` with ${paymentMethod.label}` : ""}`}
          onPress={onPressBuy}
        />
      </View>
    </PaymentScreen>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
  },
  section: {
    marginTop: 40,
  },
  title: {
    fontSize: 18,
    marginBottom: 20,
    fontWeight: "bold",
  },
  paymentMethodTitle: {
    color: colors.slate,
    fontWeight: "bold",
  },
  image: {
    width: 26,
    height: 20,
  },
  text: {
    color: colors.white,
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 12,
  },
});
