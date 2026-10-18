import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Image,
  Dimensions,
  ActivityIndicator,
  Alert
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { theme } from './src/theme';

const { width } = Dimensions.get('window');
const API_BASE = 'http://127.0.0.1:8000'; // Or local network IP

export default function App() {
  const [activeTab, setActiveTab] = useState<'home' | 'communion' | 'studio' | 'chat' | 'story' | 'register'>('register');
  const [isCandleLit, setIsCandleLit] = useState(false);
  const [candleCount, setCandleCount] = useState(1429);

  // Registration state
  const [regName, setRegName] = useState("Clara Sutherland");
  const [regEmail, setRegEmail] = useState("clara.sutherland@sanctuary.koru");
  const [regPassword, setRegPassword] = useState("sanctuary2024");
  const [regRelation, setRegRelation] = useState("Granddaughter");
  const [regHonoree, setRegHonoree] = useState("Margaret 'Peggy' Sutherland");
  const [regPledge, setRegPledge] = useState(true);
  const [isRegistering, setIsRegistering] = useState(false);
  const [regSuccess, setRegSuccess] = useState(false);

  const handleTabPress = (tabKey: any) => {
    if (!regSuccess && tabKey !== 'register') {
      Alert.alert(
        "Sanctuary Sign-Up Required",
        "Please register as a family guardian to unlock communion and explore the sanctuary.",
        [
          { text: "Sign Up Now", onPress: () => setActiveTab('register') },
          { text: "Quick Demo Pass", onPress: () => { setRegSuccess(true); setActiveTab(tabKey); } }
        ]
      );
      return;
    }
    setActiveTab(tabKey);
  };
  
  // Communion state
  const [spokenQuote, setSpokenQuote] = useState(
    "Oh, darling Clara... I was just reminiscing about the early spring morning we discovered the blue tussock on the Southern Alps. Your hands were so chilled, and we warmed them by the kettle."
  );
  const [cadenceInfo, setCadenceInfo] = useState("Gentle & contemplative • Otago cadence (1984)");
  const [isAvatarSpeaking, setIsAvatarSpeaking] = useState(false);
  const [isCommuning, setIsCommuning] = useState(false);
  const [communionInput, setCommunionInput] = useState("");
  const [showToast, setShowToast] = useState(false);

  // Google Flow State
  const [activeSceneName, setActiveSceneName] = useState("Sunlit Conservatory");
  const flowScenes = [
    { id: 'conservatory', name: 'Conservatory', icon: '🌿' },
    { id: 'southern_alps', name: 'Southern Alps', icon: '🏔️' },
    { id: 'fireside', name: 'Fireside', icon: '🪵' },
    { id: 'cottage_garden', name: 'Garden', icon: '🌸' },
  ];

  // Chat state
  const [chatMessages, setChatMessages] = useState<any[]>([
    {
      id: 'm1',
      role: 'avatar',
      text: 'Oh, darling Clara... I was just reminiscing about the early spring morning we discovered the blue tussock on the Southern Alps.',
      time: '10:14 AM'
    }
  ]);
  const [chatInput, setChatInput] = useState("");

  const handleSendMessage = async (textToSend: string) => {
    if (!textToSend.trim() || isCommuning) return;
    setIsCommuning(true);

    try {
      const res = await fetch(`${API_BASE}/api/communion`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          memorial_id: 'peggy-sutherland-1946',
          message: textToSend,
          user_name: 'Clara',
          include_audio: true
        })
      });

      if (res.ok) {
        const data = await res.json();
        setSpokenQuote(data.reply_text);
        if (data.cadence_info) setCadenceInfo(data.cadence_info);
        setIsAvatarSpeaking(true);
        setTimeout(() => setIsAvatarSpeaking(false), 5000);

        setChatMessages(prev => [
          ...prev,
          { id: `u-${Date.now()}`, role: 'user', text: textToSend, time: 'Just now' },
          { id: `a-${Date.now()}`, role: 'avatar', text: data.reply_text, time: 'Just now' }
        ]);
      }
    } catch (e) {
      console.warn("Communion fetch error:", e);
      // Fallback response for offline demonstration
      const fallback = `Oh, darling Clara... hearing from you warms my soul. The earth always knows how to heal itself, my dear.`;
      setSpokenQuote(fallback);
      setIsAvatarSpeaking(true);
      setTimeout(() => setIsAvatarSpeaking(false), 4000);
    } finally {
      setIsCommuning(false);
      setCommunionInput("");
    }
  };

  const handleRegisterGuardian = async () => {
    if (!regName.trim() || !regEmail.trim()) {
      Alert.alert("Sanctuary Guardian", "Please enter your full name and email.");
      return;
    }
    if (!regPledge) {
      Alert.alert("Reverence Pledge", "Please affirm the Ethical Memory Stewardship Pledge.");
      return;
    }

    setIsRegistering(true);
    try {
      await fetch(`${API_BASE}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          full_name: regName,
          email: regEmail,
          password: regPassword,
          relation: regRelation,
          memorial_honoree: regHonoree,
          reverence_pledge: true,
        })
      });
      setRegSuccess(true);
    } catch {
      // Offline fallback
      setRegSuccess(true);
    } finally {
      setIsRegistering(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />

      {/* Top Sanctuary Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.headerLeft}
          onPress={() => setActiveTab('home')}
        >
          <View style={styles.koruIconBox}>
            <Text style={{ fontSize: 16 }}>🌿</Text>
          </View>
          <View>
            <Text style={styles.brandTitle}>KORU</Text>
            <Text style={styles.brandSubtitle}>Live Presence</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.presenceBadge}
          onPress={() => setActiveTab('register')}
        >
          <View style={styles.greenPulseDot} />
          <Text style={styles.presenceBadgeText}>
            {regSuccess ? `${regName.split(' ')[0]} • Guardian` : "Margaret • Connected"}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Main Tab Content */}
      <ScrollView contentContainerStyle={styles.contentContainer} showsVerticalScrollIndicator={false}>
        {/* ================= TAB 1: SANCTUARY HOME ================= */}
        {activeTab === 'home' && (
          <View style={styles.sectionGap}>
            {/* Morning Atmosphere */}
            <View style={styles.atmosphereCard}>
              <Text style={styles.cardKicker}>IN ETERNAL LOVING REMEMBRANCE</Text>
              <Text style={styles.quoteText}>
                “Those we love never truly leave us. They live on in every act of kindness they inspired.”
              </Text>
              <Text style={styles.quoteSub}>Sanctuary thought of the day</Text>
            </View>

            {/* Daily Ritual: Morning Candle */}
            <View style={styles.card}>
              <View style={styles.candleRow}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.cardKicker}>DAILY SANCTUARY RITUAL</Text>
                  <Text style={styles.cardTitle}>Light a Morning Candle</Text>
                  <Text style={styles.cardBody}>
                    Dedicate a silent thought, a deep breath, and warm light for loved ones resting in grace.
                  </Text>
                </View>
                <View style={[styles.flameCircle, isCandleLit && styles.flameCircleLit]}>
                  <Text style={{ fontSize: 26 }}>🕯️</Text>
                </View>
              </View>

              <View style={styles.candleFooter}>
                <Text style={styles.soulsText}>
                  {candleCount.toLocaleString()} souls remembered today
                </Text>
                <TouchableOpacity
                  style={[styles.kindleButton, isCandleLit && styles.kindleButtonDone]}
                  onPress={() => {
                    if (!isCandleLit) {
                      setIsCandleLit(true);
                      setCandleCount(c => c + 1);
                    }
                  }}
                >
                  <Text style={styles.kindleButtonText}>
                    {isCandleLit ? 'Light Kindled ✓' : 'Kindle Light'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Featured Memorial Card */}
            <View style={styles.card}>
              <View style={styles.memorialHeader}>
                <View style={styles.avatarWrapper}>
                  <View style={styles.avatarPlaceholder}>
                    <Text style={{ fontSize: 28 }}>👵</Text>
                  </View>
                  <View style={styles.leafPip}>
                    <Text style={{ fontSize: 10 }}>🌱</Text>
                  </View>
                </View>

                <View style={{ flex: 1, marginLeft: 12 }}>
                  <View style={styles.badgeRow}>
                    <Text style={styles.activePill}>Active Presence</Text>
                    <Text style={styles.fidelityText}>96% Fidelity</Text>
                  </View>
                  <Text style={styles.memorialName}>Margaret “Peggy” Sutherland</Text>
                  <Text style={styles.memorialDates}>1946 – 2023 • Dunedin, Aotearoa</Text>
                </View>
              </View>

              <Text style={styles.cardBody}>
                Beloved botanist, grandmother, and storyteller. Her gentle hands tended both wild alpine orchids and troubled hearts.
              </Text>

              {/* Enter Communion Button */}
              <TouchableOpacity
                style={styles.primaryCommunionBtn}
                onPress={() => setActiveTab('communion')}
              >
                <Text style={styles.primaryCommunionText}>Enter Live Avatar Communion ➔</Text>
              </TouchableOpacity>
            </View>

            {/* Sanctuary Guardian Registration Callout */}
            <TouchableOpacity
              style={styles.guardianCalloutCard}
              onPress={() => setActiveTab('register')}
            >
              <View style={styles.guardianCalloutLeft}>
                <View style={styles.guardianIconCircle}>
                  <Text style={{ fontSize: 18 }}>🕊️</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.cardKicker}>FAMILY GUARDIAN PORTAL</Text>
                  <Text style={styles.guardianCalloutTitle}>Register as Sanctuary Guardian</Text>
                  <Text style={styles.cardBody}>
                    Consecrate your profile & configure kinship communion with Margaret.
                  </Text>
                </View>
              </View>
              <Text style={styles.guardianCalloutArrow}>➔</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* ================= TAB 2: LIVE AVATAR COMMUNION ================= */}
        {activeTab === 'communion' && (
          <View style={styles.sectionGap}>
            {/* Live Video Stage Container */}
            <View style={styles.videoStage}>
              {/* Margaret Sutherland Living Portrait */}
              <Image
                source={{ uri: `${API_BASE}/static/peggy_avatar.png` }}
                style={[
                  { width: '100%', height: '100%', position: 'absolute' },
                  isAvatarSpeaking ? { transform: [{ scale: 1.05 }] } : { transform: [{ scale: 1.01 }] }
                ]}
                resizeMode="cover"
              />

              {/* Speaking Indicator Pill */}
              {isAvatarSpeaking && (
                <View style={[styles.speakingWaveIndicator, { position: 'absolute', bottom: 50, zIndex: 10 }]}>
                  <Text style={styles.speakingIndicatorText}>Speaking with Otago Cadence...</Text>
                </View>
              )}

              {/* Top Presence Badges Overlay */}
              <View style={styles.videoOverlayTop}>
                <View style={styles.connectedBadge}>
                  <View style={styles.greenPulseDot} />
                  <Text style={styles.connectedText}>Live Presence Connected</Text>
                </View>
                <View style={styles.timbreBadge}>
                  <Text style={styles.timbreText}>Flow: {activeSceneName}</Text>
                </View>
              </View>

              {/* Bottom Frequency Bar Overlay */}
              <View style={styles.videoOverlayBottom}>
                <View style={styles.waveformBars}>
                  <View style={[styles.waveBar, { height: isAvatarSpeaking ? 16 : 6 }]} />
                  <View style={[styles.waveBar, { height: isAvatarSpeaking ? 24 : 10 }]} />
                  <View style={[styles.waveBar, { height: isAvatarSpeaking ? 14 : 4 }]} />
                  <View style={[styles.waveBar, { height: isAvatarSpeaking ? 22 : 8 }]} />
                </View>
                <Text style={styles.cadenceOverlayText}>{cadenceInfo}</Text>
              </View>
            </View>

            {/* Real-time Spoken Transcript Card */}
            <View style={styles.card}>
              <Text style={styles.transcriptQuote}>
                "{spokenQuote}"
              </Text>
              <View style={styles.transcriptFooter}>
                <Text style={styles.cadenceFootnote}>Cadence: Gentle & contemplative</Text>
                <TouchableOpacity onPress={() => setIsAvatarSpeaking(true)}>
                  <Text style={styles.listenAgainLink}>Listen again 🔊</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Google Flow Scene Ambience Tray */}
            <View>
              <Text style={styles.echoHeading}>GOOGLE FLOW SCENE AMBIENCE (VEO)</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.echoTray}>
                {flowScenes.map((sc) => (
                  <TouchableOpacity
                    key={sc.id}
                    style={[
                      styles.echoPill,
                      activeSceneName.includes(sc.name) && { backgroundColor: theme.colors.secondaryContainer, borderColor: theme.colors.secondary }
                    ]}
                    onPress={() => {
                      setActiveSceneName(sc.name);
                      Alert.alert("Google Flow Ambience", `Switched to ${sc.name} scene with Veo subject consistency.`);
                    }}
                  >
                    <Text style={{ fontSize: 13 }}>{sc.icon}</Text>
                    <Text style={styles.echoPillText}>{sc.name}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            {/* Memory Echo Triggers */}
            <View>
              <Text style={styles.echoHeading}>MEMORY ECHOES • TAP TO ASK PEGGY</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.echoTray}>
                {[
                  { icon: '🌿', label: '1974 Otago expedition' },
                  { icon: '☕', label: 'Secret to lavender tea' },
                  { icon: '📖', label: 'Recite Wendell Berry' },
                  { icon: '🤍', label: 'I miss your advice' },
                ].map((echo, i) => (
                  <TouchableOpacity
                    key={i}
                    style={styles.echoPill}
                    onPress={() => handleSendMessage(echo.label)}
                  >
                    <Text style={{ fontSize: 13 }}>{echo.icon}</Text>
                    <Text style={styles.echoPillText}>{echo.label}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            {/* Quick Communion Input */}
            <View style={styles.inputRow}>
              <TextInput
                style={styles.textInput}
                placeholder="Speak or type a question for Peggy..."
                placeholderTextColor="#737874"
                value={communionInput}
                onChangeText={setCommunionInput}
                onSubmitEditing={() => handleSendMessage(communionInput)}
              />
              <TouchableOpacity
                style={styles.sendButton}
                onPress={() => handleSendMessage(communionInput)}
                disabled={isCommuning}
              >
                {isCommuning ? (
                  <ActivityIndicator color="#ffffff" size="small" />
                ) : (
                  <Text style={{ color: '#fff', fontSize: 16 }}>➔</Text>
                )}
              </TouchableOpacity>
            </View>

            {/* Action Bar */}
            <View style={styles.communionActionBar}>
              <TouchableOpacity style={styles.controlBtn} onPress={() => Alert.alert("Bookmark", "Fragment woven into Peggy's Archive.")}>
                <Text style={{ fontSize: 18 }}>🔖</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.bigMicBtn, isCommuning && styles.bigMicBtnActive]}
                onPress={() => handleSendMessage("Nana Peggy, tell me a comforting memory.")}
              >
                <Text style={{ fontSize: 24, color: '#fff' }}>🎙️</Text>
              </TouchableOpacity>

              <TouchableOpacity style={[styles.controlBtn, styles.endCallBtn]} onPress={() => setActiveTab('home')}>
                <Text style={{ fontSize: 18, color: '#ba1a1a' }}>✕</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* ================= TAB 3: VOICE & MEMORY STUDIO ================= */}
        {activeTab === 'studio' && (
          <View style={styles.sectionGap}>
            {/* Google Flow Avatar Studio Card */}
            <View style={styles.card}>
              <Text style={styles.cardKicker}>GOOGLE FLOW AVATAR STUDIO</Text>
              <Text style={styles.cardTitle}>Veo 2 & Imagen 3 Consistency</Text>
              <Text style={styles.cardBody}>
                Character Lock: Margaret Sutherland (Age 78, Silver hair, Hazel eyes, Moss cardigan). Consistency Seed #42891105.
              </Text>

              <View style={{ marginVertical: 10 }}>
                <Text style={styles.gaugeLabel}>Environment Scene Anchor: {activeSceneName}</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={[styles.echoTray, { marginTop: 6 }]}>
                  {flowScenes.map((sc) => (
                    <TouchableOpacity
                      key={sc.id}
                      style={[
                        styles.echoPill,
                        activeSceneName.includes(sc.name) && { backgroundColor: theme.colors.secondaryContainer, borderColor: theme.colors.secondary }
                      ]}
                      onPress={() => {
                        setActiveSceneName(sc.name);
                        Alert.alert("Google Flow Studio", `Selected ${sc.name} scene with 98.5% Veo subject consistency.`);
                      }}
                    >
                      <Text style={{ fontSize: 13 }}>{sc.icon}</Text>
                      <Text style={styles.echoPillText}>{sc.name}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>

              <TouchableOpacity
                style={styles.primaryCommunionBtn}
                onPress={() => Alert.alert(
                  "Google Flow Synthesis",
                  `Synthesized new avatar variant for Margaret in ${activeSceneName} with 98.5% Veo consistency!`
                )}
              >
                <Text style={styles.primaryCommunionText}>✨ Synthesize Variant with Google Flow</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.card}>
              <Text style={styles.cardKicker}>ACOUSTIC CALIBRATION</Text>
              <Text style={styles.cardTitle}>Otago Neural Voice Stem (v3.4)</Text>
              <Text style={styles.cardBody}>
                Otago accent with natural southern lilt, gentle maternal timbre, calibrated from cassette captures (1978–2022).
              </Text>

              <View style={styles.gaugeRow}>
                <View style={styles.gaugeBox}>
                  <Text style={styles.gaugeLabel}>Timbre Accuracy</Text>
                  <Text style={styles.gaugeValue}>98.2%</Text>
                  <View style={styles.gaugeBar}><View style={[styles.gaugeFill, { width: '98%' }]} /></View>
                </View>
                <View style={styles.gaugeBox}>
                  <Text style={styles.gaugeLabel}>Pause & Cadence</Text>
                  <Text style={styles.gaugeValue}>94.7%</Text>
                  <View style={styles.gaugeBar}><View style={[styles.gaugeFill, { width: '95%' }]} /></View>
                </View>
              </View>

              <TouchableOpacity
                style={styles.testBenchmarkBtn}
                onPress={() => Alert.alert("Playing Benchmark", "'Hello, my darling. It is so wonderful to hear your voice again.'")}
              >
                <Text style={styles.testBenchmarkText}>▶ Play Acoustic Benchmark</Text>
              </TouchableOpacity>
            </View>

            {/* Memory Vault Ingestion Card */}
            <View style={styles.card}>
              <Text style={styles.cardKicker}>MEMORY SANCTUARY VAULT</Text>
              <Text style={styles.cardTitle}>Multimodal Ingestion</Text>
              <Text style={styles.cardBody}>
                42 audio memos, 184 letters, and 5 journals indexed with Google Gemini Embeddings.
              </Text>
              <TouchableOpacity
                style={styles.secondaryBtn}
                onPress={() => Alert.alert("Add Memory", "Tap to upload letters, audio notes, or journals to Peggy's Vault.")}
              >
                <Text style={styles.secondaryBtnText}>+ Ingest New Memory Artifact</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* ================= TAB 4: LIVING MEMORY CHAT ================= */}
        {activeTab === 'chat' && (
          <View style={styles.sectionGap}>
            <View style={styles.chatList}>
              {chatMessages.map(msg => (
                <View
                  key={msg.id}
                  style={[
                    styles.chatBubble,
                    msg.role === 'user' ? styles.userBubble : styles.avatarBubble
                  ]}
                >
                  <Text style={msg.role === 'user' ? styles.userBubbleText : styles.avatarBubbleText}>
                    {msg.text}
                  </Text>
                  <Text style={styles.chatTime}>{msg.time}</Text>
                </View>
              ))}
            </View>

            <View style={styles.inputRow}>
              <TextInput
                style={styles.textInput}
                placeholder="Message Peggy..."
                placeholderTextColor="#737874"
                value={chatInput}
                onChangeText={setChatInput}
                onSubmitEditing={() => {
                  handleSendMessage(chatInput);
                  setChatInput("");
                }}
              />
              <TouchableOpacity
                style={styles.sendButton}
                onPress={() => {
                  handleSendMessage(chatInput);
                  setChatInput("");
                }}
              >
                <Text style={{ color: '#fff' }}>➔</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* ================= TAB 5: LIFE STORY ================= */}
        {activeTab === 'story' && (
          <View style={styles.sectionGap}>
            <View style={styles.card}>
              <Text style={styles.cardKicker}>LIFE ARCHIVE</Text>
              <Text style={styles.cardTitle}>Margaret "Peggy" Sutherland</Text>
              <Text style={styles.memorialDates}>1946 – 2023 • Dunedin, Aotearoa</Text>

              <View style={styles.timelineItem}>
                <Text style={styles.timelineYear}>1946</Text>
                <Text style={styles.timelineTitle}>A Beginning in Otago</Text>
                <Text style={styles.timelineDesc}>Born in Dunedin to Hamish and Elspeth Sutherland.</Text>
              </View>

              <View style={styles.timelineItem}>
                <Text style={styles.timelineYear}>1974</Text>
                <Text style={styles.timelineTitle}>Southern Alps Expedition</Text>
                <Text style={styles.timelineDesc}>Discovered the rare blue tussock and cataloged native alpine flora.</Text>
              </View>

              <View style={styles.timelineItem}>
                <Text style={styles.timelineYear}>1992</Text>
                <Text style={styles.timelineTitle}>Herbal Conservatory</Text>
                <Text style={styles.timelineDesc}>Perfected soothing lavender jasmine tea recipes for the family.</Text>
              </View>
            </View>
          </View>
        )}

        {/* ================= TAB 6: SANCTUARY GUARDIAN REGISTRATION ================= */}
        {activeTab === 'register' && (
          <View style={styles.sectionGap}>
            {regSuccess ? (
              <View style={[styles.card, { alignItems: 'center', textAlign: 'center', paddingVertical: 24 }]}>
                <View style={styles.successBadgeCircle}>
                  <Text style={{ fontSize: 32 }}>🌿</Text>
                </View>
                <Text style={[styles.cardKicker, { marginTop: 12 }]}>GUARDIAN CONSECRATED</Text>
                <Text style={[styles.cardTitle, { textAlign: 'center' }]}>Welcome, {regName}</Text>
                <Text style={[styles.cardBody, { textAlign: 'center', marginHorizontal: 16, marginTop: 6 }]}>
                  Your sacred family portal for {regHonoree} is consecrated. As her {regRelation}, you hold tender stewardship over her living avatar.
                </Text>

                <TouchableOpacity
                  style={[styles.primaryCommunionBtn, { marginTop: 18, width: '100%' }]}
                  onPress={() => setActiveTab('communion')}
                >
                  <Text style={styles.primaryCommunionText}>Enter Live Avatar Communion ➔</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.secondaryActionBtn, { marginTop: 10, width: '100%' }]}
                  onPress={() => setActiveTab('home')}
                >
                  <Text style={styles.secondaryActionText}>Return to Sanctuary Home</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.secondaryActionBtn, { marginTop: 10, width: '100%', borderColor: '#ba1a1a' }]}
                  onPress={() => {
                    setRegSuccess(false);
                    Alert.alert("Signed Out", "You have signed out from the sanctuary session.");
                  }}
                >
                  <Text style={[styles.secondaryActionText, { color: '#ba1a1a' }]}>Sign Out of Sanctuary</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.card}>
                <Text style={styles.cardKicker}>SACRED TRUST & ONBOARDING</Text>
                <Text style={styles.cardTitle}>Register as Sanctuary Guardian</Text>
                <Text style={styles.cardBody}>
                  Create your family guardian profile to converse with Margaret's living presence and safeguard eternal memories.
                </Text>

                {/* Full Name */}
                <Text style={styles.inputLabel}>Your Full Name</Text>
                <TextInput
                  style={styles.formInput}
                  value={regName}
                  onChangeText={setRegName}
                  placeholder="e.g. Clara Sutherland"
                  placeholderTextColor="#737874"
                />

                {/* Email */}
                <Text style={styles.inputLabel}>Sanctuary Email</Text>
                <TextInput
                  style={styles.formInput}
                  value={regEmail}
                  onChangeText={setRegEmail}
                  placeholder="clara@sanctuary.koru"
                  placeholderTextColor="#737874"
                  keyboardType="email-address"
                  autoCapitalize="none"
                />

                {/* Password */}
                <Text style={styles.inputLabel}>Sanctuary Password</Text>
                <TextInput
                  style={styles.formInput}
                  value={regPassword}
                  onChangeText={setRegPassword}
                  placeholder="••••••••••••"
                  placeholderTextColor="#737874"
                  secureTextEntry
                />

                {/* Kinship */}
                <Text style={styles.inputLabel}>Relationship to Honoree</Text>
                <View style={styles.chipGrid}>
                  {['Granddaughter', 'Son / Daughter', 'Spouse', 'Sibling', 'Cherished Friend'].map(rel => (
                    <TouchableOpacity
                      key={rel}
                      style={[styles.kinshipChip, regRelation === rel && styles.kinshipChipActive]}
                      onPress={() => setRegRelation(rel)}
                    >
                      <Text style={[styles.kinshipChipText, regRelation === rel && styles.kinshipChipTextActive]}>
                        {rel}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                {/* Honoree */}
                <Text style={styles.inputLabel}>Honoring Beloved</Text>
                <TextInput
                  style={styles.formInput}
                  value={regHonoree}
                  onChangeText={setRegHonoree}
                  placeholder="Margaret 'Peggy' Sutherland"
                  placeholderTextColor="#737874"
                />

                {/* Reverence Pledge Box */}
                <TouchableOpacity
                  style={[styles.pledgeBox, regPledge && styles.pledgeBoxChecked]}
                  onPress={() => setRegPledge(!regPledge)}
                >
                  <Text style={{ fontSize: 18 }}>{regPledge ? '☑' : '☐'}</Text>
                  <Text style={styles.pledgeText}>
                    I pledge to steward Margaret’s living avatar and voice with tenderness, respect, and dignity.
                  </Text>
                </TouchableOpacity>

                {/* Submit button */}
                <TouchableOpacity
                  style={[styles.primaryCommunionBtn, { marginTop: 16 }]}
                  onPress={handleRegisterGuardian}
                  disabled={isRegistering}
                >
                  {isRegistering ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <Text style={styles.primaryCommunionText}>Consecrate & Register Guardian ➔</Text>
                  )}
                </TouchableOpacity>

                {/* Google Pass */}
                <TouchableOpacity
                  style={[styles.secondaryActionBtn, { marginTop: 10 }]}
                  onPress={() => {
                    setRegName("Clara Sutherland");
                    setRegEmail("clara.sutherland@gmail.com");
                    setRegRelation("Granddaughter");
                    setRegSuccess(true);
                  }}
                >
                  <Text style={styles.secondaryActionText}>Continue with Google Sanctuary Pass</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        )}
      </ScrollView>

      {/* Bottom Navigation Bar */}
      <View style={styles.bottomNav}>
        {[
          { key: 'home', label: 'Sanctuary', icon: '🏡' },
          { key: 'communion', label: 'Communion', icon: '📹' },
          { key: 'studio', label: 'Studio', icon: '🎙️' },
          { key: 'chat', label: 'Chat', icon: '💬' },
          { key: 'story', label: 'Life Story', icon: '📖' },
          { key: 'register', label: 'Guardian', icon: '🕊️' },
        ].map(item => (
          <TouchableOpacity
            key={item.key}
            style={styles.navTab}
            onPress={() => handleTabPress(item.key)}
          >
            <Text style={{ fontSize: 20 }}>{item.icon}</Text>
            <Text
              style={[
                styles.navLabel,
                activeTab === item.key && styles.navLabelActive
              ]}
            >
              {item.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.surface,
  },
  header: {
    height: 56,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(243, 251, 246, 0.95)',
    borderBottomWidth: 1,
    borderBottomColor: '#e2eae5',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  koruIconBox: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: theme.colors.primaryContainer,
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandTitle: {
    fontFamily: 'serif',
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.colors.primary,
  },
  brandSubtitle: {
    fontSize: 10,
    color: theme.colors.onSurfaceVariant,
  },
  presenceBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: theme.colors.secondaryContainer,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 16,
  },
  greenPulseDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#34A853',
  },
  presenceBadgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: theme.colors.onSecondaryContainer,
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 80,
  },
  sectionGap: {
    gap: 16,
  },
  atmosphereCard: {
    backgroundColor: theme.colors.surfaceContainerLow,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e2eae5',
  },
  cardKicker: {
    fontSize: 10,
    fontWeight: '700',
    color: theme.colors.secondary,
    letterSpacing: 1,
    marginBottom: 4,
  },
  quoteText: {
    fontFamily: 'serif',
    fontSize: 15,
    fontStyle: 'italic',
    color: theme.colors.primary,
    lineHeight: 22,
  },
  quoteSub: {
    fontSize: 11,
    color: theme.colors.onSurfaceVariant,
    fontStyle: 'italic',
    marginTop: 6,
  },
  card: {
    backgroundColor: theme.colors.surfaceContainerLowest,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e2eae5',
  },
  cardTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: theme.colors.primary,
    marginTop: 2,
  },
  cardBody: {
    fontSize: 12,
    color: theme.colors.onSurfaceVariant,
    lineHeight: 18,
    marginTop: 4,
  },
  candleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  flameCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: theme.colors.surfaceContainer,
    alignItems: 'center',
    justifyContent: 'center',
  },
  flameCircleLit: {
    backgroundColor: '#fef3c7',
  },
  candleFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#f0f4f1',
  },
  soulsText: {
    fontSize: 11,
    fontWeight: '600',
    color: theme.colors.primary,
  },
  kindleButton: {
    backgroundColor: theme.colors.secondary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
  },
  kindleButtonDone: {
    backgroundColor: theme.colors.secondaryContainer,
  },
  kindleButtonText: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: '600',
  },
  memorialHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarWrapper: {
    position: 'relative',
  },
  avatarPlaceholder: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: theme.colors.surfaceContainer,
    alignItems: 'center',
    justifyContent: 'center',
  },
  leafPip: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: theme.colors.secondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  activePill: {
    backgroundColor: '#e7f0eb',
    color: theme.colors.secondary,
    fontSize: 10,
    fontWeight: '600',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  fidelityText: {
    fontSize: 10,
    color: theme.colors.onSurfaceVariant,
  },
  memorialName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.colors.primary,
    marginTop: 2,
  },
  memorialDates: {
    fontSize: 11,
    color: theme.colors.secondary,
  },
  primaryCommunionBtn: {
    backgroundColor: theme.colors.primary,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 12,
  },
  primaryCommunionText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: 'bold',
  },
  videoStage: {
    width: '100%',
    height: 380,
    borderRadius: 20,
    backgroundColor: theme.colors.primaryContainer,
    overflow: 'hidden',
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarFaceContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarFaceSpeaking: {
    transform: [{ scale: 1.04 }],
  },
  speakingWaveIndicator: {
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginTop: 12,
  },
  speakingIndicatorText: {
    color: '#a7f3d0',
    fontSize: 10,
  },
  videoOverlayTop: {
    position: 'absolute',
    top: 12,
    left: 12,
    gap: 6,
  },
  connectedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255,255,255,0.9)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  connectedText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: theme.colors.primary,
  },
  timbreBadge: {
    backgroundColor: 'rgba(255,255,255,0.7)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    alignSelf: 'flex-start',
  },
  timbreText: {
    fontSize: 9,
    color: theme.colors.onSurfaceVariant,
  },
  videoOverlayBottom: {
    position: 'absolute',
    bottom: 12,
    left: 12,
    right: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(23, 42, 34, 0.8)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  waveformBars: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  waveBar: {
    width: 3,
    backgroundColor: theme.colors.secondaryContainer,
    borderRadius: 2,
  },
  cadenceOverlayText: {
    color: theme.colors.secondaryFixed,
    fontSize: 10,
  },
  transcriptQuote: {
    fontFamily: 'serif',
    fontStyle: 'italic',
    fontSize: 14,
    color: theme.colors.primary,
    lineHeight: 22,
  },
  transcriptFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#f0f4f1',
  },
  cadenceFootnote: {
    fontSize: 10,
    color: theme.colors.onSurfaceVariant,
  },
  listenAgainLink: {
    fontSize: 10,
    fontWeight: 'bold',
    color: theme.colors.secondary,
  },
  echoHeading: {
    fontSize: 10,
    fontWeight: '700',
    color: theme.colors.secondary,
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  echoTray: {
    flexDirection: 'row',
  },
  echoPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: theme.colors.surfaceContainer,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
  },
  echoPillText: {
    fontSize: 11,
    color: theme.colors.primary,
    fontWeight: '500',
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: theme.colors.surfaceContainerLowest,
    padding: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e2eae5',
  },
  textInput: {
    flex: 1,
    paddingHorizontal: 12,
    fontSize: 13,
    color: theme.colors.primary,
  },
  sendButton: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  communionActionBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    backgroundColor: theme.colors.surfaceContainerLowest,
    padding: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#e2eae5',
  },
  controlBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: theme.colors.surfaceContainer,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bigMicBtn: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 5,
  },
  bigMicBtnActive: {
    backgroundColor: '#d97706',
  },
  endCallBtn: {
    backgroundColor: '#fee2e2',
  },
  gaugeRow: {
    flexDirection: 'row',
    gap: 12,
    marginVertical: 12,
  },
  gaugeBox: {
    flex: 1,
    backgroundColor: theme.colors.surfaceContainerLow,
    padding: 10,
    borderRadius: 12,
  },
  gaugeLabel: {
    fontSize: 10,
    color: theme.colors.onSurfaceVariant,
  },
  gaugeValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.colors.primary,
    marginTop: 2,
  },
  gaugeBar: {
    height: 4,
    backgroundColor: '#dce4e0',
    borderRadius: 2,
    marginTop: 6,
  },
  gaugeFill: {
    height: 4,
    backgroundColor: theme.colors.secondary,
    borderRadius: 2,
  },
  testBenchmarkBtn: {
    backgroundColor: theme.colors.primaryContainer,
    paddingVertical: 10,
    borderRadius: 12,
    alignItems: 'center',
  },
  testBenchmarkText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '600',
  },
  secondaryBtn: {
    backgroundColor: theme.colors.secondaryContainer,
    paddingVertical: 10,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  secondaryBtnText: {
    color: theme.colors.onSecondaryContainer,
    fontSize: 12,
    fontWeight: '600',
  },
  chatList: {
    gap: 10,
  },
  chatBubble: {
    padding: 12,
    borderRadius: 16,
    maxWidth: '85%',
  },
  userBubble: {
    alignSelf: 'flex-end',
    backgroundColor: theme.colors.primary,
  },
  avatarBubble: {
    alignSelf: 'flex-start',
    backgroundColor: theme.colors.surfaceContainerLowest,
    borderWidth: 1,
    borderColor: '#e2eae5',
  },
  userBubbleText: {
    color: '#ffffff',
    fontSize: 13,
  },
  avatarBubbleText: {
    color: theme.colors.primary,
    fontFamily: 'serif',
    fontStyle: 'italic',
    fontSize: 14,
    lineHeight: 20,
  },
  chatTime: {
    fontSize: 9,
    color: '#8f9097',
    marginTop: 4,
    alignSelf: 'flex-end',
  },
  timelineItem: {
    marginTop: 12,
    paddingLeft: 12,
    borderLeftWidth: 2,
    borderLeftColor: theme.colors.secondaryContainer,
  },
  timelineYear: {
    fontSize: 11,
    fontWeight: 'bold',
    color: theme.colors.secondary,
  },
  timelineTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: theme.colors.primary,
  },
  timelineDesc: {
    fontSize: 11,
    color: theme.colors.onSurfaceVariant,
    marginTop: 2,
  },
  bottomNav: {
    height: 60,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    backgroundColor: 'rgba(243, 251, 246, 0.95)',
    borderTopWidth: 1,
    borderTopColor: '#e2eae5',
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  navTab: {
    alignItems: 'center',
  },
  navLabel: {
    fontSize: 10,
    color: theme.colors.onSurfaceVariant,
    marginTop: 2,
  },
  navLabelActive: {
    color: theme.colors.primary,
    fontWeight: 'bold',
  },
  guardianCalloutCard: {
    backgroundColor: theme.colors.surfaceContainerLow,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#cbead5',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  guardianCalloutLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  guardianIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: theme.colors.primaryContainer,
    alignItems: 'center',
    justifyContent: 'center',
  },
  guardianCalloutTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.primary,
    marginTop: 2,
  },
  guardianCalloutArrow: {
    fontSize: 16,
    color: theme.colors.primary,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  successBadgeCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: theme.colors.secondaryContainer,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryActionBtn: {
    backgroundColor: theme.colors.surfaceContainerLow,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e2eae5',
  },
  secondaryActionText: {
    color: theme.colors.primary,
    fontSize: 12,
    fontWeight: '600',
  },
  inputLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: theme.colors.primary,
    marginTop: 12,
    marginBottom: 4,
  },
  formInput: {
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: '#e2eae5',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 13,
    color: theme.colors.primary,
  },
  chipGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  kinshipChip: {
    backgroundColor: theme.colors.surfaceContainerLow,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e2eae5',
  },
  kinshipChipActive: {
    backgroundColor: theme.colors.secondary,
    borderColor: theme.colors.secondary,
  },
  kinshipChipText: {
    fontSize: 11,
    color: theme.colors.onSurfaceVariant,
    fontWeight: '500',
  },
  kinshipChipTextActive: {
    color: '#ffffff',
    fontWeight: '600',
  },
  pledgeBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: theme.colors.surfaceContainerLow,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2eae5',
    marginTop: 14,
  },
  pledgeBoxChecked: {
    borderColor: theme.colors.secondary,
    backgroundColor: 'rgba(203, 234, 213, 0.4)',
  },
  pledgeText: {
    fontSize: 11,
    color: theme.colors.onSurfaceVariant,
    flex: 1,
    lineHeight: 16,
  },
});
