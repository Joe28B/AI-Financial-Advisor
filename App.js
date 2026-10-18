import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StatusBar, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { parseTransaction, summarize, insight } from './src/finance.cjs';

const money = value => `${(value / 100).toLocaleString('en-EG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} EGP`;
const examples = ['Received 15000 salary', 'Spent 120 on lunch', 'دفعت ٥٠ مواصلات'];

export default function App() {
  const [transactions, setTransactions] = useState([]);
  const [message, setMessage] = useState('');
  const [feedback, setFeedback] = useState('Try an example below, then tap Add transaction.');
  const [error, setError] = useState(false);
  const summary = summarize(transactions);

  function addTransaction() {
    try {
      const transaction = parseTransaction(message);
      setTransactions(previous => [{ ...transaction, id: `${Date.now()}-${Math.random()}` }, ...previous]);
      setFeedback(`Added ${money(transaction.amount)} · ${transaction.category}.`);
      setError(false);
      setMessage('');
    } catch (err) {
      setFeedback(err.message);
      setError(true);
    }
  }

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.safe}>
        <StatusBar barStyle="dark-content" />
        <KeyboardAvoidingView style={styles.safe} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <ScrollView contentContainerStyle={styles.page} keyboardShouldPersistTaps="handled">
            <Text style={styles.eyebrow}>GRADUATION PROJECT · PROOF OF CONCEPT</Text>
            <Text style={styles.title}>Your money, made clearer.</Text>
            <Text style={styles.subtitle}>AI Financial Advisor · Egypt</Text>

            <View style={styles.balanceCard}>
              <Text style={styles.light}>Recorded balance</Text>
              <Text style={styles.balance}>{money(summary.balance)}</Text>
              <View style={styles.row}>
                <View style={styles.column}><Text style={styles.light}>Income</Text><Text style={styles.white}>{money(summary.income)}</Text></View>
                <View style={styles.column}><Text style={styles.light}>Expenses</Text><Text style={styles.white}>{money(summary.expenses)}</Text></View>
              </View>
              <Text style={styles.balanceNote}>All entries in this session</Text>
            </View>

            <View style={styles.card}>
              <Text style={styles.heading}>Tell us about a transaction</Text>
              <Text style={styles.body}>One income or expense in English or Arabic. EGP only.</Text>
              <View style={styles.examples}>{examples.map(example => (
                <Pressable accessibilityRole="button" key={example} onPress={() => setMessage(example)} style={styles.chip}>
                  <Text style={styles.chipText}>{example}</Text>
                </Pressable>
              ))}</View>
              <TextInput accessibilityLabel="Transaction message" style={styles.input} value={message} onChangeText={setMessage}
                placeholder="Spent 120 on lunch" placeholderTextColor="#778580" multiline maxLength={200} />
              <Pressable accessibilityRole="button" accessibilityState={{ disabled: !message.trim() }}
                disabled={!message.trim()} onPress={addTransaction} style={[styles.button, !message.trim() && styles.disabled]}>
                <Text style={styles.buttonText}>Add transaction</Text>
              </Pressable>
              <Text accessibilityLiveRegion="polite" style={[styles.body, error && styles.error]}>{feedback}</Text>
            </View>

            <View style={styles.insight}>
              <Text style={styles.heading}>Spending snapshot</Text>
              <Text style={styles.body}>{insight(summary)}</Text>
              <Text style={styles.note}>Rule-based demo · AI integration comes later</Text>
            </View>

            <View style={styles.card}>
              <Text style={styles.heading}>Recent transactions</Text>
              {!transactions.length && <Text style={styles.body}>No transactions yet. Add your first entry above.</Text>}
              {transactions.map(transaction => (
                <View key={transaction.id} style={styles.transaction}>
                  <View style={styles.column}>
                    <Text style={styles.transactionTitle}>{transaction.category}</Text>
                    <Text style={styles.body}>{transaction.description}</Text>
                    <Pressable accessibilityRole="button" accessibilityLabel={`Remove ${transaction.description}`}
                      onPress={() => setTransactions(previous => previous.filter(t => t.id !== transaction.id))} style={styles.remove}>
                      <Text style={styles.removeText}>Remove</Text>
                    </Pressable>
                  </View>
                  <Text style={styles.amount}>{transaction.type === 'income' ? '+' : '−'}{money(transaction.amount)}</Text>
                </View>
              ))}
            </View>
            <Text style={styles.note}>Prototype: entries are kept in memory and reset when the app reloads. Use sample data. This tool provides guidance, not regulated financial advice.</Text>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F3F6F2' },
  page: { padding: 22, gap: 18, maxWidth: 650, width: '100%', alignSelf: 'center', paddingBottom: 40 },
  eyebrow: { fontSize: 10, fontWeight: '700', letterSpacing: 1.5, color: '#537468', marginTop: 12 },
  title: { fontSize: 34, lineHeight: 40, fontWeight: '700', color: '#173E32' },
  subtitle: { color: '#61766C', fontSize: 16, marginTop: -8 },
  balanceCard: { backgroundColor: '#173E32', borderRadius: 22, padding: 24, gap: 12 },
  light: { color: '#C2D8CD', fontSize: 13 },
  balance: { color: '#FFFFFF', fontSize: 32, fontWeight: '700' },
  row: { flexDirection: 'row', gap: 16 },
  column: { flex: 1, gap: 4 },
  white: { color: '#FFFFFF', fontWeight: '600', fontSize: 16 },
  balanceNote: { color: '#C2D8CD', fontSize: 11 },
  card: { padding: 20, backgroundColor: '#FFFFFF', borderRadius: 20, gap: 12 },
  heading: { color: '#173E32', fontSize: 18, fontWeight: '700' },
  body: { color: '#56685E', fontSize: 14, lineHeight: 21 },
  examples: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: { paddingHorizontal: 12, paddingVertical: 12, borderRadius: 12, backgroundColor: '#EEF4EF' },
  chipText: { color: '#315F4C', fontSize: 12 },
  input: { borderWidth: 1, borderColor: '#BBCDC1', borderRadius: 12, padding: 14, minHeight: 76, fontSize: 16, color: '#173E32', textAlignVertical: 'top' },
  button: { backgroundColor: '#246B4D', padding: 16, borderRadius: 12, alignItems: 'center' },
  disabled: { opacity: 0.5 },
  buttonText: { color: '#FFFFFF', fontSize: 15, fontWeight: '700' },
  error: { color: '#AA302B' },
  insight: { backgroundColor: '#E4EDDA', padding: 20, borderRadius: 20, gap: 8 },
  note: { color: '#617366', fontSize: 12, lineHeight: 18 },
  transaction: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, borderTopWidth: 1, borderTopColor: '#E8EEE8', paddingTop: 14 },
  transactionTitle: { color: '#173E32', fontWeight: '600', fontSize: 15 },
  amount: { color: '#173E32', fontWeight: '600', fontSize: 14 },
  remove: { alignSelf: 'flex-start', paddingVertical: 12, paddingRight: 16 },
  removeText: { color: '#94524C', fontSize: 12 },
});
