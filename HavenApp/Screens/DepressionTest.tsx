import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  StyleSheet, 
  FlatList, 
  ImageBackground,
  ScrollView 
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

type RootStackParamList = {
  Home: undefined;
  Journaling: { prompt?: string };
  Mood: { mood: string };
  ChatHaven: undefined;
  Meditation: undefined;
  Insights: undefined;
  ChatWithHaven: undefined;
  Profile: undefined;
  DepressionTest: undefined;
  DepressionResults: {
    score: number;
    answers: number[];
    timestamp: string;
  };
  DepressionHistory: undefined;
  Depression: undefined;
};

type DepressionTestNavigationProp = NativeStackNavigationProp<RootStackParamList, 'DepressionTest'>;

const questions = [
    { question: 'Little interest or pleasure in doing things?' },
    { question: 'Feeling down, depressed, or hopeless?' },
    { question: 'Trouble falling or staying asleep, or sleeping too much?' },
    { question: 'Feeling tired or having little energy?' },
    { question: 'Poor appetite or overeating?' },
    { question: 'Feeling bad about yourself — or that you are a failure or have let yourself or your family down?' },
    { question: 'Trouble concentrating on things, such as reading or watching television?' },
    { question: 'Moving or speaking so slowly that other people could have noticed? Or the opposite — being so fidgety or restless that you have been moving around a lot more than usual?' },
    { question: 'Thoughts that you would be better off dead, or of hurting yourself in some way?' },
];

const options = [
    { label: 'Not at all', value: 0 },
    { label: 'Several days', value: 1 },
    { label: 'More than half the days', value: 2 },
    { label: 'Nearly every day', value: 3 },
];

const DepressionTest: React.FC = () => {
    const navigation = useNavigation<DepressionTestNavigationProp>();
    const [answers, setAnswers] = useState<number[]>(Array(questions.length).fill(-1));
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSelect = (qIdx: number, value: number) => {
        const newAnswers = [...answers];
        newAnswers[qIdx] = value;
        setAnswers(newAnswers);
    };

    const handleSubmit = async () => {
        if (answers.includes(-1) || isSubmitting) return;
        setIsSubmitting(true);
        try {
            const totalScore = answers.reduce((sum, val) => sum + (val >= 0 ? val : 0), 0);
            const timestamp = new Date().toISOString();
            navigation.navigate('DepressionResults', {
                score: totalScore,
                answers: answers,
                timestamp: timestamp,
            });
        } catch (error) {
            console.error('Error submitting test:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const getProgressPercentage = () => {
        const answeredQuestions = answers.filter(a => a !== -1).length;
        return Math.round((answeredQuestions / questions.length) * 100);
    };

    return (
        <ImageBackground
            source={require('../asserts/background.png')}
            style={styles.background}
            resizeMode="cover"
        >
            <LinearGradient colors={['#2e004f', '#000']} style={styles.overlay}>
                {/* Back Button to go to home */}
                <TouchableOpacity
                    onPress={() => navigation.goBack()}
                    style={styles.backButton}
                >
                    <Text style={styles.backText}>←</Text>
                </TouchableOpacity>

                <ScrollView contentContainerStyle={styles.scrollArea}>
                    <View style={styles.headerBox}>
                        <Text style={styles.headerTitle}>🧠 Depression Assessment</Text>
                        <Text style={styles.headerSubtitle}>
                            Over the last 2 weeks, how often have you been bothered by any of the following problems?
                        </Text>
                        {/* Progress Indicator */}
                        <View style={styles.progressContainer}>
                            <View style={styles.progressBar}>
                                <View 
                                    style={[
                                        styles.progressFill,
                                        { width: `${getProgressPercentage()}%` }
                                    ]} 
                                />
                            </View>
                            <Text style={styles.progressText}>
                                {getProgressPercentage()}% Complete ({answers.filter(a => a !== -1).length}/{questions.length})
                            </Text>
                        </View>
                    </View>

                    <FlatList
                        data={questions}
                        keyExtractor={(_, idx) => idx.toString()}
                        scrollEnabled={false}
                        renderItem={({ item, index }) => (
                            <View style={styles.questionBlock}>
                                <Text style={styles.question}>{index + 1}. {item.question}</Text>
                                <View style={styles.optionsContainer}>
                                    {options.map(opt => (
                                        <TouchableOpacity
                                            key={opt.value}
                                            style={[
                                                styles.option,
                                                answers[index] === opt.value && styles.selectedOption,
                                            ]}
                                            onPress={() => handleSelect(index, opt.value)}
                                        >
                                            <Text style={[
                                                styles.optionLabel,
                                                answers[index] === opt.value && styles.selectedOptionText
                                            ]}>
                                                {opt.label}
                                            </Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            </View>
                        )}
                    />

                    <View style={styles.bottomSection}>
                        {/* Quick Actions */}
                        <View style={styles.quickActions}>
                            <TouchableOpacity
                                style={styles.historyButton}
                                onPress={() => navigation.navigate('DepressionHistory')}
                            >
                                <Text style={styles.historyButtonText}>View History 📈</Text>
                            </TouchableOpacity>
                        </View>

                        {/* Submit Button */}
                        <TouchableOpacity
                            style={[
                                styles.submitButton,
                                (answers.includes(-1) || isSubmitting) && styles.disabledButton
                            ]}
                            onPress={handleSubmit}
                            disabled={answers.includes(-1) || isSubmitting}
                        >
                            <Text style={[
                                styles.submitButtonText,
                                (answers.includes(-1) || isSubmitting) && styles.disabledButtonText
                            ]}>
                                {isSubmitting ? 'Processing...' : 'Complete Assessment'}
                            </Text>
                        </TouchableOpacity>

                        {answers.includes(-1) && (
                            <Text style={styles.helpText}>
                                Please answer all questions to complete the assessment
                            </Text>
                        )}
                    </View>
                </ScrollView>
            </LinearGradient>
        </ImageBackground>
    );
};

const styles = StyleSheet.create({
    background: { flex: 1 },
    overlay: { flex: 1 },
    scrollArea: {
        paddingHorizontal: 20,
        paddingTop: 60,
        paddingBottom: 40,
    },
    backButton: {
        alignSelf: 'flex-start',
        marginBottom: 10,
        padding: 6,
        backgroundColor: 'rgba(255,255,255,0.1)',
        borderRadius: 8,
        position: 'absolute',
        top: 20,
        left: 20,
        zIndex: 10,
    },
    backText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
    headerBox: {
        backgroundColor: '#2e004f',
        paddingVertical: 22,
        paddingHorizontal: 20,
        borderRadius: 22,
        alignItems: 'center',
        marginBottom: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.4,
        shadowRadius: 8,
        elevation: 6,
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#fff',
        textAlign: 'center',
        marginBottom: 8,
    },
    headerSubtitle: {
        fontSize: 14,
        color: '#ccc',
        textAlign: 'center',
        lineHeight: 20,
        marginBottom: 16,
    },
    progressContainer: {
        width: '100%',
        alignItems: 'center',
    },
    progressBar: {
        width: '100%',
        height: 6,
        backgroundColor: '#444',
        borderRadius: 3,
        overflow: 'hidden',
        marginBottom: 8,
    },
    progressFill: {
        height: '100%',
        backgroundColor: '#a74eff',
        borderRadius: 3,
    },
    progressText: {
        fontSize: 12,
        color: '#ccc',
        fontStyle: 'italic',
    },
    questionBlock: { 
        backgroundColor: '#2e004f',
        padding: 18,
        borderRadius: 18,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: '#a74eff60',
    },
    question: { 
        fontSize: 16, 
        marginBottom: 12, 
        fontWeight: '500',
        color: '#fff',
        lineHeight: 22,
    },
    optionsContainer: { 
        flexDirection: 'column',
        gap: 8,
    },
    option: {
        padding: 12,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#666',
        backgroundColor: '#1a1a2e',
    },
    selectedOption: {
        backgroundColor: '#a74eff',
        borderColor: '#a74eff',
    },
    optionLabel: { 
        color: '#ccc',
        fontSize: 14,
        textAlign: 'center',
    },
    selectedOptionText: {
        color: '#fff',
        fontWeight: '600',
    },
    bottomSection: {
        marginTop: 20,
    },
    quickActions: {
        marginBottom: 16,
        alignItems: 'center',
    },
    historyButton: {
        backgroundColor: 'transparent',
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: '#a74eff',
    },
    historyButtonText: {
        color: '#a74eff',
        fontSize: 14,
        fontWeight: '500',
    },
    submitButton: {
        backgroundColor: '#a74eff',
        paddingVertical: 16,
        paddingHorizontal: 24,
        borderRadius: 30,
        alignItems: 'center',
        shadowColor: '#a74eff',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.3,
        shadowRadius: 6,
        elevation: 5,
    },
    disabledButton: {
        backgroundColor: '#666',
        shadowOpacity: 0,
        elevation: 0,
    },
    submitButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '700',
    },
    disabledButtonText: {
        color: '#999',
    },
    helpText: {
        fontSize: 12,
        color: '#ccc',
        textAlign: 'center',
        marginTop: 8,
        fontStyle: 'italic',
    },
});

export default DepressionTest;