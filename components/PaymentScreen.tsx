import { initStripe } from "@stripe/stripe-react-native";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, ScrollView, StyleSheet } from "react-native";
import { colors } from "./colors";

interface Props {
  paymentMethod?: string;
  onInit?(): void;
}

const PaymentScreen = ({
  paymentMethod,
  children,
  onInit,
}: {
  paymentMethod?: any;
  children?: any;
  onInit: () => void;
}) => {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function initialize() {
      const publishableKey =
        "pk_test_51OmJP4HiMxD69xNjoxKW190dEYRDx75AyEKHE6IhVnzZBdczLKJH3SU0G69s9kgqbormh9aHEHh2N2HiV4mnWX3M00AQd4YWAj";
      if (publishableKey) {
        await initStripe({
          publishableKey,
          setReturnUrlSchemeOnAndroid: true,
        });
        setLoading(false);
        onInit?.();
      }
    }
    initialize();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return loading ? (
    <ActivityIndicator size="large" style={StyleSheet.absoluteFill} />
  ) : (
    <ScrollView
      accessibilityLabel="payment-screen"
      style={styles.container}
      keyboardShouldPersistTaps="always"
    >
      {children}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
    paddingTop: 20,
    paddingHorizontal: 16,
  },
});

export default PaymentScreen;
