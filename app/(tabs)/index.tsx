import { Feather } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { Image } from 'expo-image';
import React, { useEffect, useState } from 'react';
import {
  Dimensions,
  Linking,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Animated, {
  Easing,
  Extrapolation,
  interpolate,
  runOnJS,
  SharedValue,
  useAnimatedRef,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width, height } = Dimensions.get('window');
const skillCardSize = (width - 64 - 16) / 2;
const CARD_W = width * 0.65;
const CARD_H = 460;
const CARD_GAP = 30;
const SNAP_INTERVAL = CARD_W + CARD_GAP;
const CAROUSEL_SIDE_PAD = (width - CARD_W) / 2;
const MOCKUP_H = CARD_H * 0.60;
const INFO_H = CARD_H * 0.40;

const PROJECTS = [
  {
    id: '1',
    title: 'Livora',
    description:
      'Livora is a smart dorm finder with map search and AI chatbot support.',
    tags: ['PHP', 'HTML', 'CSS', 'Javascript'],
    icon: 'layers' as const,
    accent: '#62e4c8ff',
    mockupBg: '#0D0820',
    mockupImage: require('@/assets/images/livora.png'),
  },
  {
    id: '2',
    title: 'Señas',
    description:
      'A Filipino sign language learning platform with real-time gesture recognition and a teacher dashboard.',
    tags: ['Laravel', 'Docker'],
    icon: 'check-square' as const,
    accent: '#002fffff',
    mockupBg: '#051A10',
    mockupImage: require('@/assets/images/senas.png'),
  },
  {
    id: '3',
    title: 'Blessence',
    description:
      'An online makeup store with quiz-based recommendations and real-time virtual try-on.',
    tags: ['PHP', 'HTML', 'CSS', 'Javascript'],
    icon: 'users' as const,
    accent: '#ff008cff',
    mockupBg: '#050E1A',
    mockupImage: require('@/assets/images/Blessence.jpg'),
  },
  {
    id: '4',
    title: 'ABM Conqueror',
    description:
      'A real estate home finder with listings, filters, and contract management.',
    tags: ['CodeIgniter', 'HTML', 'CSS', 'Javascript'],
    icon: 'tool' as const,
    accent: '#21a33eff',
    mockupBg: '#150800',
    mockupImage: require('@/assets/images/amb.png'),
  },
];

const LOOP_PROJECTS = [
  PROJECTS[PROJECTS.length - 1],
  ...PROJECTS,
  PROJECTS[0],
];

type Project = (typeof PROJECTS)[0];

const ROLES = ['Developer', 'UI/UX Designer', 'Freelancer'];

function TypingLabel() {
  const [displayed, setDisplayed] = useState('');
  const [roleIdx, setRoleIdx] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  const [cursorVisible, setCursorVisible] = useState(true);

  useEffect(() => {
    const blink = setInterval(() => setCursorVisible((v) => !v), 500);
    return () => clearInterval(blink);
  }, []);

  useEffect(() => {
    const full = ROLES[roleIdx];
    let timeout: ReturnType<typeof setTimeout>;

    if (!isDeleting && displayed.length < full.length) {
      timeout = setTimeout(() => setDisplayed(full.slice(0, displayed.length + 1)), 90);
    } else if (!isDeleting && displayed.length === full.length) {
      timeout = setTimeout(() => setIsDeleting(true), 1600);
    } else if (isDeleting && displayed.length > 0) {
      timeout = setTimeout(() => setDisplayed(full.slice(0, displayed.length - 1)), 55);
    } else if (isDeleting && displayed.length === 0) {
      setIsDeleting(false);
      setRoleIdx((i) => (i + 1) % ROLES.length);
    }

    return () => clearTimeout(timeout);
  }, [displayed, isDeleting, roleIdx]);

  return (
    <Text style={[styles.footerText, { marginBottom: 8, fontWeight: 'bold', minWidth: 160 }]}>
      {displayed}
      <Text style={{ opacity: cursorVisible ? 1 : 0, color: '#A78BFA' }}>|</Text>
    </Text>
  );
}

function CardGrid() {
  return (
    <View style={StyleSheet.absoluteFillObject} pointerEvents="none">
      {Array.from({ length: 7 }).map((_, i) => (
        <View
          key={`c${i}`}
          style={{
            position: 'absolute',
            left: (CARD_W / 6) * i,
            top: 0,
            bottom: 0,
            width: 1,
            backgroundColor: 'rgba(255,255,255,0.03)',
          }}
        />
      ))}
      {Array.from({ length: 11 }).map((_, i) => (
        <View
          key={`r${i}`}
          style={{
            position: 'absolute',
            top: (MOCKUP_H / 10) * i,
            left: 0,
            right: 0,
            height: 1,
            backgroundColor: 'rgba(255,255,255,0.03)',
          }}
        />
      ))}
    </View>
  );
}

const AnimatedBlurView = Animated.createAnimatedComponent(BlurView);

function ProjectCard({
  project,
  index,
  scrollX,
}: {
  project: Project;
  index: number;
  scrollX: SharedValue<number>;
}) {
  const animStyle = useAnimatedStyle(() => {
    const center = index * SNAP_INTERVAL;
    const inputRange = [center - SNAP_INTERVAL, center, center + SNAP_INTERVAL];
    const scale = interpolate(scrollX.value, inputRange, [0.85, 1, 0.85], Extrapolation.CLAMP);
    const opacity = interpolate(scrollX.value, inputRange, [0.45, 1, 0.45], Extrapolation.CLAMP);

    const shift = CARD_W * 0.38;
    const translateX = interpolate(
      scrollX.value,
      [center - SNAP_INTERVAL, center, center + SNAP_INTERVAL],
      [-shift, 0, shift],
      Extrapolation.CLAMP
    );

    const zIndex = Math.round(
      interpolate(scrollX.value, inputRange, [1, 10, 1], Extrapolation.CLAMP)
    );

    const elevation = Math.round(
      interpolate(scrollX.value, inputRange, [2, 16, 2], Extrapolation.CLAMP)
    );

    return {
      transform: [{ scale }, { translateX }],
      opacity,
      zIndex,
      elevation,
    };
  });

  const blurAnimStyle = useAnimatedStyle(() => {
    const center = index * SNAP_INTERVAL;
    const inputRange = [center - SNAP_INTERVAL, center, center + SNAP_INTERVAL];
    const opacity = interpolate(scrollX.value, inputRange, [1, 0, 1], Extrapolation.CLAMP);
    return { opacity };
  });

  const visibleTags = project.tags.slice(0, 2);
  const extraCount = project.tags.length - 2;

  return (
    <Animated.View
      style={[
        {
          width: CARD_W,
          height: CARD_H,
          borderRadius: 20,
          overflow: 'hidden',
          marginRight: CARD_GAP,
          borderWidth: 1,
          borderColor: 'rgba(255,255,255,0.08)',
          shadowColor: project.accent,
          shadowOffset: { width: 0, height: 12 },
          shadowOpacity: 0.22,
          shadowRadius: 20,
          backgroundColor: 'rgba(12, 12, 20, 0.20)',
        },
        animStyle,
      ]}
    >
      <View style={{ flex: 1 }}>
        <View
          style={{
            height: MOCKUP_H,
            backgroundColor: project.mockupBg,
            overflow: 'hidden',
          }}
        >
          <Image
            source={project.mockupImage}
            style={StyleSheet.absoluteFillObject}
            contentFit="cover"
          />
          <CardGrid />
          <View
            pointerEvents="none"
            style={{
              position: 'absolute',
              bottom: -50,
              alignSelf: 'center',
              width: 160,
              height: 160,
              borderRadius: 80,
              backgroundColor: project.accent + '22',
            }}
          />
          <View
            pointerEvents="none"
            style={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              height: 60,
              backgroundColor: 'rgba(10,10,16,0.50)',
            }}
          />
        </View>

        <View
          style={{
            height: INFO_H,
            backgroundColor: 'rgba(10, 10, 18, 0.75)',
            paddingHorizontal: 18,
            paddingTop: 14,
            paddingBottom: 14,
            borderTopWidth: 1,
            borderTopColor: 'rgba(255,255,255,0.08)',
            justifyContent: 'space-between',
          }}
        >
          <View style={{ gap: 6 }}>
            <Text
              style={{
                fontSize: 16,
                fontWeight: 'bold',
                color: '#FFFFFF',
                letterSpacing: -0.3,
              }}
              numberOfLines={1}
            >
              {project.title}
            </Text>
            <Text
              style={{ fontSize: 12.5, color: 'rgba(255,255,255,0.60)', lineHeight: 18 }}
              numberOfLines={3}
            >
              {project.description}
            </Text>
          </View>

          <View style={{ height: 1, backgroundColor: 'rgba(255,255,255,0.07)', marginVertical: 2 }} />

          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, flexShrink: 1 }}>
              <View style={{ width: 5, height: 5, borderRadius: 2.5, backgroundColor: project.accent }} />
              <Text
                style={{ fontSize: 11, color: project.accent, fontWeight: '700', letterSpacing: 0.4 }}
                numberOfLines={1}
              >
                {visibleTags.join(' • ')}
                {extraCount > 0 && (
                  <Text style={{ color: 'rgba(255,255,255,0.35)' }}>{`  +${extraCount}`}</Text>
                )}
              </Text>
            </View>
          </View>
        </View>
      </View>

      <AnimatedBlurView
        intensity={30}
        tint="dark"
        style={[StyleSheet.absoluteFillObject, blurAnimStyle]}
        pointerEvents="none"
      />
    </Animated.View>
  );
}

function SectionGrid() {
  return (
    <View style={StyleSheet.absoluteFillObject} pointerEvents="none">
      {Array.from({ length: 11 }).map((_, i) => (
        <View
          key={`c${i}`}
          style={{
            position: 'absolute',
            left: (width / 10) * i,
            top: 0,
            bottom: 0,
            width: 1,
            backgroundColor: 'rgba(255,255,255,0.022)',
          }}
        />
      ))}
      {Array.from({ length: 18 }).map((_, i) => (
        <View
          key={`r${i}`}
          style={{
            position: 'absolute',
            top: i * 52,
            left: 0,
            right: 0,
            height: 1,
            backgroundColor: 'rgba(255,255,255,0.022)',
          }}
        />
      ))}
      <View
        style={{
          position: 'absolute',
          top: 180,
          left: width / 2 - 130,
          width: 260,
          height: 260,
          borderRadius: 130,
          backgroundColor: 'rgba(167,139,250,0.045)',
        }}
      />
    </View>
  );
}

export default function HomeScreen() {
  const insets = useSafeAreaInsets();

  const [textWidth, setTextWidth] = useState(0);
  const translateX = useSharedValue(0);
  const scrollY = useSharedValue(0);

  const carouselRef = useAnimatedRef<Animated.ScrollView>();
  const carouselScrollX = useSharedValue(0);
  const [activeIndex, setActiveIndex] = useState(0);
  const loopIndexRef = React.useRef(1);

  const scrollViewRef = React.useRef<Animated.ScrollView>(null);
  const contactSectionY = React.useRef(0);
  const scrollToContact = () => {
    scrollViewRef.current?.scrollTo({ y: contactSectionY.current, animated: true });
  };

  const scrollHandler = useAnimatedScrollHandler((event) => {
    scrollY.value = event.contentOffset.y;
  });

  const updateLoopIndex = (idx: number) => {
    loopIndexRef.current = idx;
  };

  const carouselHandler = useAnimatedScrollHandler({
    onScroll: (e) => {
      carouselScrollX.value = e.contentOffset.x;
      const idx = Math.round(e.contentOffset.x / SNAP_INTERVAL);

      let activeIdx = idx - 1;
      if (idx === 0) activeIdx = PROJECTS.length - 1;
      else if (idx === PROJECTS.length + 1) activeIdx = 0;

      const boundedIdx = Math.max(0, Math.min(activeIdx, PROJECTS.length - 1));
      runOnJS(setActiveIndex)(boundedIdx);
      runOnJS(updateLoopIndex)(idx);
    },
  });

  const handleScrollEndEvent = (e: { nativeEvent: { contentOffset: { x: number } } }) => {
    const x = e.nativeEvent.contentOffset.x;
    const idx = Math.round(x / SNAP_INTERVAL);
    if (idx === 0) {
      const realLastX = PROJECTS.length * SNAP_INTERVAL;
      carouselRef.current?.scrollTo({ x: realLastX, y: 0, animated: false });
      loopIndexRef.current = PROJECTS.length;
    } else if (idx === PROJECTS.length + 1) {
      carouselRef.current?.scrollTo({ x: SNAP_INTERVAL, y: 0, animated: false });
      loopIndexRef.current = 1;
    }
  };

  useEffect(() => {
    if (textWidth > 0) {
      translateX.value = width;
      translateX.value = withRepeat(
        withTiming(-textWidth, { duration: 15000, easing: Easing.linear }),
        -1,
        false
      );
    }
  }, [textWidth]);

  useEffect(() => {
    const timer = setInterval(() => {
      let next = loopIndexRef.current + 1;
      if (next > PROJECTS.length + 1) next = 1;
      carouselRef.current?.scrollTo({ x: next * SNAP_INTERVAL, y: 0, animated: true });
      if (next === PROJECTS.length + 1) {
        setTimeout(() => {
          carouselRef.current?.scrollTo({ x: SNAP_INTERVAL, y: 0, animated: false });
          loopIndexRef.current = 1;
        }, 400);
      } else {
        loopIndexRef.current = next;
      }
    }, 3500);

    return () => clearInterval(timer);
  }, []);

  const marqueeStyle = useAnimatedStyle(() => ({ transform: [{ translateX: translateX.value }] }));

  const SCROLL_END = height * 0.8;

  const morphingImageStyle = useAnimatedStyle(() => ({
    position: 'absolute',
    top: scrollY.value + interpolate(scrollY.value, [0, SCROLL_END], [0, insets.top + 20], Extrapolation.CLAMP),
    left: interpolate(scrollY.value, [0, SCROLL_END], [0, 24], Extrapolation.CLAMP),
    width: interpolate(scrollY.value, [0, SCROLL_END], [width, 80], Extrapolation.CLAMP),
    height: interpolate(scrollY.value, [0, SCROLL_END], [height, 80], Extrapolation.CLAMP),
    borderRadius: interpolate(scrollY.value, [0, SCROLL_END], [0, 40], Extrapolation.CLAMP),
    borderWidth: interpolate(scrollY.value, [0, SCROLL_END], [0, 3], Extrapolation.CLAMP),
    borderColor: '#FFFFFF',
    zIndex: 100,
    overflow: 'hidden',
  }));

  const stickyBannerStyle = useAnimatedStyle(() => ({
    position: 'absolute',
    top: scrollY.value,
    left: 0,
    right: 0,
    height: 80 + insets.top,
    zIndex: 90,
    opacity: interpolate(scrollY.value, [SCROLL_END * 0.5, SCROLL_END], [0, 1], Extrapolation.CLAMP),
  }));

  const heroFadeStyle = useAnimatedStyle(() => ({
    opacity: interpolate(scrollY.value, [0, SCROLL_END * 0.6], [1, 0], Extrapolation.CLAMP),
    transform: [
      { translateY: interpolate(scrollY.value, [0, SCROLL_END * 0.6], [0, -50], Extrapolation.CLAMP) },
    ],
    zIndex: 200,
  }));

  return (
    <View style={{ flex: 1 }}>
      <Animated.ScrollView
        ref={scrollViewRef}
        style={styles.scrollContainer}
        bounces={false}
        onScroll={scrollHandler}
        scrollEventThrottle={16}
      >
        <Animated.View style={stickyBannerStyle} pointerEvents="box-none">
          <View style={[styles.stickyBanner, { paddingTop: insets.top }]}>
            <View style={styles.stickyHeaderContent}>
              <Text style={styles.stickyHeaderTextLeft}>© Christian Paul</Text>
              <TouchableOpacity onPress={scrollToContact} activeOpacity={0.7}>
                <Text style={styles.stickyHeaderTextRight}>Contact</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Animated.View>

        <Animated.View style={morphingImageStyle} pointerEvents="none">
          <Image
            source={require('@/assets/images/profilepicture.png')}
            style={StyleSheet.absoluteFillObject}
            contentFit="cover"
          />
        </Animated.View>

        <Animated.View
          style={[styles.heroContainer, heroFadeStyle, { paddingTop: insets.top, paddingBottom: insets.bottom }]}
        >
          <View style={styles.header}>
            <Text style={styles.headerText}>© Christian Paul</Text>
            <TouchableOpacity onPress={scrollToContact} activeOpacity={0.7}>
              <Text style={styles.headerText}>Contact</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.textOverlayContainer} pointerEvents="none">
            <Animated.View style={[{ flexDirection: 'row', width: 10000 }, marqueeStyle]}>
              <Text
                style={styles.largeText}
                onLayout={(e) => setTextWidth(e.nativeEvent.layout.width)}
                numberOfLines={1}
              >
                Christian Paul E. Mendoza
              </Text>
            </Animated.View>
          </View>
          <View style={styles.footer}>
            <View style={styles.footerLeft}>
              <TypingLabel />
              <Text style={styles.footerText}>Creates clean code and</Text>
              <Text style={styles.footerText}>practical solutions that work.</Text>
            </View>
            <View style={styles.footerRight}>
              <View style={styles.logoC}>
                <Text style={styles.logoCText}>C</Text>
              </View>
            </View>
          </View>

          <View style={styles.heroScrollHint} pointerEvents="none">
            <Text style={styles.heroScrollHintText}>About Me</Text>
            <Feather name="chevron-down" size={14} color="rgba(255,255,255,0.45)" />
          </View>
        </Animated.View>

        <View style={styles.aboutContainer}>
          <View style={styles.aboutContent}>
            <Text style={styles.aboutTitle}>ABOUT ME</Text>
            <Text style={styles.aboutParagraph}>
              I am an <Text style={styles.aboutBold}>Information Technology student</Text> who builds{' '}
              <Text style={styles.aboutBold}>practical and reliable software</Text>.
            </Text>
            <Text style={styles.aboutParagraph}>
              I develop <Text style={styles.aboutBold}>web and mobile applications</Text> with{' '}
              <Text style={styles.aboutBold}>clean code</Text>, strong performance, and user-focused design.
            </Text>
            <Text style={styles.aboutParagraph}>
              I aim to grow as a developer by creating{' '}
              <Text style={styles.aboutBold}>systems that works</Text> and deliver{' '}
              <Text style={styles.aboutBold}>consistent results</Text>.
            </Text>
            <View style={styles.aboutLinks}>
              <TouchableOpacity
                style={styles.aboutLinkItem}
                onPress={() => Linking.openURL('https://www.instagram.com/popopopaul_/')}
                activeOpacity={0.7}
              >
                <Text style={styles.aboutLinkText}>INSTAGRAM</Text>
                <Feather name="arrow-up-right" size={14} color="white" />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.aboutLinkItem}
                onPress={() => Linking.openURL('https://www.facebook.com/christianpaul.mendoza.108')}
                activeOpacity={0.7}
              >
                <Text style={styles.aboutLinkText}>FACEBOOK</Text>
                <Feather name="arrow-up-right" size={14} color="white" />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.aboutLinkItem}
                onPress={() => Linking.openURL('https://www.linkedin.com/in/christian-paul-mendoza/')}
                activeOpacity={0.7}
              >
                <Text style={styles.aboutLinkText}>LINKEDIN</Text>
                <Feather name="arrow-up-right" size={14} color="white" />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        <View style={styles.skillsContainer}>
          <Text style={styles.skillsTitle}>
            My <Text style={styles.skillsTitleBold}>Skills</Text>
          </Text>
          <View style={styles.skillsGrid}>
            <View style={styles.skillCard}>
              <View style={styles.skillIconContainer}>
                <Text style={styles.expoIconText}>ex</Text>
              </View>
              <Text style={styles.skillLabel}>Expo</Text>
            </View>
            <View style={styles.skillCard}>
              <View style={styles.skillIconContainer}>
                <View style={styles.lightningCircle}>
                  <Feather name="zap" size={24} color="#00D8FF" />
                </View>
              </View>
              <Text style={styles.skillLabel}>React Native</Text>
            </View>
            <View style={styles.skillCard}>
              <View style={styles.skillIconContainer}>
                <View style={styles.jsBox}>
                  <Text style={styles.jsBoxText}>JS</Text>
                </View>
              </View>
              <Text style={styles.skillLabel}>JavaScript</Text>
            </View>
            <View style={[styles.skillCard, styles.skillCardInverted]}>
              <View style={styles.skillIconContainer}>
                <View style={styles.tsBox}>
                  <Text style={styles.tsBoxText}>TS</Text>
                </View>
              </View>
              <Text style={[styles.skillLabel, styles.skillLabelInverted]}>TypeScript</Text>
            </View>
            <View style={styles.skillCard}>
              <View style={styles.skillIconContainer}>
                <View style={styles.sqlBox}>
                  <Text style={styles.sqlBoxText}>S</Text>
                </View>
              </View>
              <Text style={styles.skillLabel}>SQL</Text>
            </View>
            <View style={styles.skillCard}>
              <View style={styles.skillIconContainer}>
                <Feather name="git-branch" size={32} color="#F05032" />
              </View>
              <Text style={styles.skillLabel}>Git</Text>
            </View>
          </View>
        </View>

        <View style={styles.projectsSection}>
          <SectionGrid />

          <View style={styles.projectsHeader}>
            <View>
              <Text style={styles.projectsTitle}>Projects</Text>
            </View>
            <View style={styles.projectsCounter}>
              <Text style={styles.projectsCounterActive}>
                {String(activeIndex + 1).padStart(2, '0')}
              </Text>
              <Text style={styles.projectsCounterTotal}>
                {' '}/ {String(PROJECTS.length).padStart(2, '0')}
              </Text>
            </View>
          </View>

          <Animated.ScrollView
            ref={carouselRef}
            horizontal
            showsHorizontalScrollIndicator={false}
            snapToInterval={SNAP_INTERVAL}
            decelerationRate="fast"
            contentOffset={{ x: SNAP_INTERVAL, y: 0 }}
            onMomentumScrollEnd={handleScrollEndEvent}
            onScrollEndDrag={handleScrollEndEvent}
            contentContainerStyle={{
              paddingHorizontal: CAROUSEL_SIDE_PAD,
              paddingVertical: 28,
            }}
            onScroll={carouselHandler}
            scrollEventThrottle={16}
          >
            {LOOP_PROJECTS.map((project, index) => (
              <ProjectCard
                key={`${project.id}-${index}`}
                project={project}
                index={index}
                scrollX={carouselScrollX}
              />
            ))}
          </Animated.ScrollView>

          <View style={styles.dotsRow}>
            {PROJECTS.map((p, i) => (
              <TouchableOpacity
                key={i}
                activeOpacity={0.7}
                onPress={() => {
                  carouselRef.current?.scrollTo({ x: (i + 1) * SNAP_INTERVAL, y: 0, animated: true });
                  setActiveIndex(i);
                  loopIndexRef.current = i + 1;
                }}
              >
                <View
                  style={[
                    styles.dot,
                    i === activeIndex
                      ? [styles.dotActive, { backgroundColor: PROJECTS[activeIndex].accent }]
                      : styles.dotInactive,
                  ]}
                />
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View
          style={styles.contactSection}
          onLayout={(e) => { contactSectionY.current = e.nativeEvent.layout.y; }}
        >

          <View style={styles.contactHeadingRow}>
            <Text style={styles.contactEyebrow}>GET IN TOUCH</Text>
            <Text style={styles.contactTitle}>Let's{`\n`}Connect.</Text>
          </View>

          <View style={styles.contactItems}>
            <TouchableOpacity
              style={styles.contactRow}
              activeOpacity={0.7}
              onPress={() => Linking.openURL('mailto:christianpaulmendoza10@gmail.com')}
            >
              <View style={styles.contactIconWrap}>
                <Feather name="mail" size={18} color="rgba(255,255,255,0.55)" />
              </View>
              <View style={styles.contactTextWrap}>
                <Text style={styles.contactLabel}>Email</Text>
                <Text style={styles.contactValue}>christianpaulmendoza10@gmail.com</Text>
              </View>
              <Feather name="arrow-up-right" size={14} color="rgba(255,255,255,0.25)" />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.contactRow}
              activeOpacity={0.7}
              onPress={() => Linking.openURL('tel:+639615656675')}
            >
              <View style={styles.contactIconWrap}>
                <Feather name="phone" size={18} color="rgba(255,255,255,0.55)" />
              </View>
              <View style={styles.contactTextWrap}>
                <Text style={styles.contactLabel}>Phone</Text>
                <Text style={styles.contactValue}>0961 565 6675</Text>
              </View>
              <Feather name="arrow-up-right" size={14} color="rgba(255,255,255,0.25)" />
            </TouchableOpacity>

            <View style={styles.contactRow}>
              <View style={styles.contactIconWrap}>
                <Feather name="map-pin" size={18} color="rgba(255,255,255,0.55)" />
              </View>
              <View style={styles.contactTextWrap}>
                <Text style={styles.contactLabel}>Location</Text>
                <Text style={styles.contactValue}>Nasugbu, Batangas</Text>
              </View>
            </View>
          </View>

          <View style={styles.contactFooterBar}>
            <Text style={styles.contactFooterText}>
              © {new Date().getFullYear()} Christian Paul Mendoza
            </Text>
            <Text style={styles.contactFooterText}>All rights reserved.</Text>
          </View>
        </View>

        <View style={styles.bottomSpacer} />
      </Animated.ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  scrollContainer: { flex: 1, backgroundColor: '#050505' },

  heroContainer: {
    height,
    backgroundColor: 'transparent',
    justifyContent: 'space-between',
    zIndex: 200,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingTop: 20,
    zIndex: 10,
  },
  headerText: { color: 'white', fontSize: 14, fontWeight: '500' },
  textOverlayContainer: { position: 'absolute', top: height * 0.55, left: 0, zIndex: 2 },
  largeText: {
    color: 'white',
    fontSize: width * 0.35,
    fontWeight: '600',
    letterSpacing: -4,
    textShadowColor: 'rgba(0,0,0,0.1)',
    textShadowOffset: { width: 0, height: 4 },
    textShadowRadius: 10,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    paddingHorizontal: 24,
    paddingBottom: 40,
    zIndex: 10,
  },
  footerLeft: { flexDirection: 'column' },
  footerText: { color: 'white', fontSize: 16, fontWeight: '500', lineHeight: 24 },
  footerRight: { justifyContent: 'flex-end', paddingBottom: 4 },
  logoC: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: 'white',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoCText: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
    includeFontPadding: false,
    textAlignVertical: 'center',
  },
  heroScrollHint: {
    position: 'absolute',
    bottom: 18,
    left: 0,
    right: 0,
    alignItems: 'center',
    flexDirection: 'column',
    gap: 4,
    zIndex: 5,
  },
  heroScrollHintText: {
    color: 'rgba(255,255,255,0.45)',
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 2,
    textTransform: 'uppercase',
  },

  stickyBanner: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '100%',
    backgroundColor: '#1C1C1E',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.08)',
  },
  stickyHeaderContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
  },
  stickyHeaderTextLeft: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 14,
    fontWeight: 'bold',
    marginLeft: 96,
  },
  stickyHeaderTextRight: { color: 'rgba(255,255,255,0.9)', fontSize: 14, fontWeight: 'bold' },

  aboutContainer: { backgroundColor: '#050505', paddingBottom: 80, paddingTop: 80, zIndex: 10 },
  aboutContent: { paddingHorizontal: 32 },
  aboutTitle: {
    fontSize: 50,
    fontWeight: 'bold',
    color: '#FFF',
    letterSpacing: -2,
    transform: [{ scaleY: 1.5 }],
    marginBottom: 50,
    marginTop: 20,
  },
  aboutParagraph: { fontSize: 20, lineHeight: 36, color: '#A0A0A0', marginBottom: 24, fontWeight: '500' },
  aboutBold: { color: '#FFF', fontWeight: 'bold' },
  aboutLinks: { flexDirection: 'row', gap: 24, marginTop: 24 },
  aboutLinkItem: { flexDirection: 'row', alignItems: 'flex-start', gap: 2 },
  aboutLinkText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: 'bold',
    letterSpacing: 0.5,
    transform: [{ scaleY: 1.3 }],
  },

  skillsContainer: { backgroundColor: '#FFFFFF', paddingVertical: 60, paddingHorizontal: 32 },
  skillsTitle: { fontSize: 50, color: '#050505', textAlign: 'center', marginBottom: 40, letterSpacing: -0.5 },
  skillsTitleBold: { fontWeight: 'bold' },
  skillsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 16, justifyContent: 'space-between' },
  skillCard: {
    width: skillCardSize,
    height: skillCardSize,
    borderWidth: 1.5,
    borderColor: '#000000',
    backgroundColor: '#FFFFFF',
    padding: 16,
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  skillCardInverted: { backgroundColor: '#050505', borderColor: '#000000' },
  skillIconContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  skillLabel: { fontSize: 14, fontWeight: 'bold', color: '#000000', textAlign: 'center' },
  skillLabelInverted: { color: '#FFFFFF' },
  expoIconText: { fontSize: 40, fontStyle: 'italic', fontWeight: '300', color: '#000000' },
  lightningCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1.5,
    borderColor: '#61DAFB',
    backgroundColor: 'rgba(97,218,251,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  jsBox: { width: 36, height: 36, backgroundColor: '#F7DF1E', justifyContent: 'flex-end', alignItems: 'flex-end', padding: 4 },
  jsBoxText: { color: '#000000', fontWeight: 'bold', fontSize: 13 },
  tsBox: { width: 36, height: 36, backgroundColor: '#3178C6', justifyContent: 'flex-end', alignItems: 'flex-end', padding: 4 },
  tsBoxText: { color: '#FFFFFF', fontWeight: 'bold', fontSize: 13 },
  sqlBox: {
    width: 36,
    height: 36,
    borderWidth: 1.5,
    borderColor: '#336791',
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(51,103,145,0.08)',
  },
  sqlBoxText: { fontWeight: 'bold', fontSize: 22, color: '#336791' },

  projectsSection: {
    backgroundColor: '#000000',
    paddingTop: 60,
    paddingBottom: 50,
    overflow: 'hidden',
  },
  projectsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    paddingHorizontal: 28,
    marginBottom: 2,
  },
  projectsEyebrow: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.26)',
    fontWeight: '700',
    letterSpacing: 2.5,
    marginBottom: 5,
  },
  projectsTitle: {
    fontSize: 44,
    fontWeight: 'bold',
    color: '#FFFFFF',
    letterSpacing: -1.5,
  },
  projectsCounter: { flexDirection: 'row', alignItems: 'baseline' },
  projectsCounterActive: { fontSize: 24, fontWeight: 'bold', color: '#FFFFFF' },
  projectsCounterTotal: { fontSize: 13, color: 'rgba(255,255,255,0.26)', fontWeight: '500' },

  dotsRow: { flexDirection: 'row', justifyContent: 'center', gap: 8, marginTop: 8 },
  dot: { height: 5, borderRadius: 2.5 },
  dotActive: { width: 20 },
  dotInactive: { width: 5, backgroundColor: 'rgba(255,255,255,0.18)' },

  bottomSpacer: { height: 40, backgroundColor: '#050505' },

  contactSection: {
    backgroundColor: '#050505',
    paddingTop: 60,
    paddingBottom: 0,
  },
  contactDivider: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.08)',
    marginHorizontal: 28,
    marginBottom: 48,
  },
  contactHeadingRow: {
    paddingHorizontal: 28,
    marginBottom: 44,
  },
  contactEyebrow: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.26)',
    fontWeight: '700',
    letterSpacing: 2.5,
    marginBottom: 10,
  },
  contactTitle: {
    fontSize: 52,
    fontWeight: 'bold',
    color: '#FFFFFF',
    letterSpacing: -2,
    lineHeight: 56,
  },
  contactItems: {
    paddingHorizontal: 20,
    gap: 0,
  },
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 20,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.06)',
    gap: 16,
  },
  contactIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.07)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  contactTextWrap: {
    flex: 1,
    gap: 2,
  },
  contactLabel: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.30)',
    fontWeight: '600',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  contactValue: {
    fontSize: 15,
    color: '#FFFFFF',
    fontWeight: '500',
  },
  contactFooterBar: {
    marginTop: 48,
    paddingVertical: 24,
    paddingHorizontal: 28,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.06)',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  contactFooterText: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.22)',
    fontWeight: '500',
  },
});
