import { useTheme } from "@/shared/hooks/useTheme";
import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useWithdrawal } from "../hooks/useWallet";

interface WithdrawalModalProps {
  visible: boolean;
  onClose: () => void;
  currentBalance: number;
}

export function WithdrawalModal({
  visible,
  onClose,
  currentBalance,
}: WithdrawalModalProps) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const { requestWithdrawal, isRequesting } = useWithdrawal();
  const [amount, setAmount] = useState("");
  const [bankClabe, setBankClabe] = useState("");
  const [bankName, setBankName] = useState("");

  const parsedAmount = Number.parseFloat(amount) || 0;
  const isValid =
    parsedAmount >= 500 &&
    parsedAmount <= currentBalance &&
    bankClabe.length === 18 &&
    bankName.length > 0;

  const handleSubmit = () => {
    if (!isValid) return;

    Alert.alert(
      "Confirmar retiro",
      `¿Deseas retirar $${parsedAmount.toFixed(2)} MXN a la cuenta ${bankName} ***${bankClabe.slice(-4)}?`,
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Confirmar",
          style: "default",
          onPress: () => {
            requestWithdrawal(
              {
                amount: parsedAmount,
                bankClabe,
                bankName,
              },
              {
                onSuccess: () => {
                  setAmount("");
                  setBankClabe("");
                  setBankName("");
                  onClose();
                },
              },
            );
          },
        },
      ],
    );
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.overlay}
      >
        <Pressable style={styles.backdrop} onPress={onClose} />
        <View
          style={[
            styles.sheet,
            {
              backgroundColor: colors.background,
              paddingBottom: insets.bottom + 20,
            },
          ]}
        >
          {/* Handle */}
          <View style={styles.handleContainer}>
            <View style={[styles.handle, { backgroundColor: colors.border }]} />
          </View>

          <Text style={[styles.title, { color: colors.text }]}>
            Solicitar Retiro
          </Text>

          <Text style={[styles.balanceText, { color: colors.textSecondary }]}>
            Balance disponible: ${currentBalance.toFixed(2)} MXN
          </Text>

          {/* Amount Input */}
          <View style={styles.fieldGroup}>
            <Text style={[styles.label, { color: colors.text }]}>
              Monto a retirar (MXN)
            </Text>
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: colors.surfaceSecondary,
                  color: colors.text,
                  borderColor: colors.border,
                },
              ]}
              placeholder="500.00"
              placeholderTextColor={colors.textTertiary}
              keyboardType="decimal-pad"
              value={amount}
              onChangeText={setAmount}
            />
            {parsedAmount > 0 && parsedAmount < 500 && (
              <Text style={[styles.fieldError, { color: colors.error }]}>
                Mínimo $500 MXN
              </Text>
            )}
            {parsedAmount > currentBalance && (
              <Text style={[styles.fieldError, { color: colors.error }]}>
                Monto excede tu balance
              </Text>
            )}
          </View>

          {/* Bank Name */}
          <View style={styles.fieldGroup}>
            <Text style={[styles.label, { color: colors.text }]}>Banco</Text>
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: colors.surfaceSecondary,
                  color: colors.text,
                  borderColor: colors.border,
                },
              ]}
              placeholder="Ej. BBVA, Santander"
              placeholderTextColor={colors.textTertiary}
              value={bankName}
              onChangeText={setBankName}
            />
          </View>

          {/* CLABE */}
          <View style={styles.fieldGroup}>
            <Text style={[styles.label, { color: colors.text }]}>
              CLABE interbancaria (18 dígitos)
            </Text>
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: colors.surfaceSecondary,
                  color: colors.text,
                  borderColor: colors.border,
                },
              ]}
              placeholder="012345678901234567"
              placeholderTextColor={colors.textTertiary}
              keyboardType="number-pad"
              maxLength={18}
              value={bankClabe}
              onChangeText={setBankClabe}
            />
            {bankClabe.length > 0 && bankClabe.length < 18 && (
              <Text style={[styles.fieldError, { color: colors.error }]}>
                La CLABE debe tener 18 dígitos
              </Text>
            )}
          </View>

          {/* Info Note */}
          <View
            style={[
              styles.infoNote,
              { backgroundColor: colors.surfaceSecondary },
            ]}
          >
            <Ionicons
              name="information-circle-outline"
              size={16}
              color={colors.textSecondary}
            />
            <Text style={[styles.infoText, { color: colors.textSecondary }]}>
              El retiro se procesará en 3-5 días hábiles vía transferencia SPEI.
              Sin comisiones.
            </Text>
          </View>

          {/* Submit Button */}
          <Pressable
            style={[
              styles.submitButton,
              {
                backgroundColor: isValid
                  ? colors.primary
                  : colors.surfaceSecondary,
              },
            ]}
            onPress={handleSubmit}
            disabled={!isValid || isRequesting}
          >
            {isRequesting ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Text
                style={[
                  styles.submitButtonText,
                  { color: isValid ? "#FFFFFF" : colors.textTertiary },
                ]}
              >
                Solicitar Retiro
              </Text>
            )}
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "flex-end",
  },
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
  },
  sheet: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
  },
  handleContainer: {
    alignItems: "center",
    marginBottom: 16,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 4,
  },
  balanceText: {
    fontSize: 14,
    marginBottom: 20,
  },
  fieldGroup: {
    marginBottom: 16,
    gap: 6,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
  },
  input: {
    height: 48,
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 14,
    fontSize: 16,
  },
  fieldError: {
    fontSize: 12,
  },
  infoNote: {
    flexDirection: "row",
    gap: 8,
    padding: 12,
    borderRadius: 12,
    marginBottom: 20,
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 18,
  },
  submitButton: {
    height: 52,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: "700",
  },
});
