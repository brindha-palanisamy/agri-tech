import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart, BarChart, Bar
} from 'recharts';
import {
  Leaf, Droplets, Sun, TrendingUp, Wallet, Award, Send, Home, Bot, CreditCard, Bell, Search, ArrowUp, ArrowDown, Check, Clock, Zap, Sprout, Thermometer, Gauge, Info, Star, Users, Shield
} from 'lucide-react';

// Types
interface SensorData {
  nitrogen: number;
  phosphorus: number;
  potassium: number;
  ph: number;
  moisture: number;
  timestamp: string;
}

interface Message {
  id: number;
  text: string;
  isUser: boolean;
  timestamp: string;
}

interface Scheme {
  id: number;
  title: string;
  description: string;
  eligibility: string;
  matchPercent: number;
  deadline: string;
  category: string;
  benefits: string;
}

interface CarbonTransaction {
  id: number;
  date: string;
  type: 'earned' | 'redeemed';
  amount: number;
  description: string;
}

interface CommunityTip {
  id: number;
  author: string;
  avatar: string;
  tip: string;
  likes: number;
  crop: string;
}

// Mock Data
const mockHistoricalData = [
  { day: 'Mon', moisture: 65, ph: 6.8, npk: 72 },
  { day: 'Tue', moisture: 58, ph: 6.5, npk: 68 },
  { day: 'Wed', moisture: 71, ph: 7.0, npk: 75 },
  { day: 'Thu', moisture: 62, ph: 6.7, npk: 70 },
  { day: 'Fri', moisture: 68, ph: 6.9, npk: 74 },
  { day: 'Sat', moisture: 55, ph: 6.4, npk: 65 },
  { day: 'Sun', moisture: 70, ph: 6.8, npk: 73 },
];

const mockSchemes: Scheme[] = [
  {
    id: 1,
    title: 'PM-KISAN Samman Nidhi',
    description: 'Direct income support of ₹6,000 per year to farmer families across the country.',
    eligibility: 'Land owning farmers',
    matchPercent: 92,
    deadline: '2025-03-31',
    category: 'Income Support',
    benefits: '₹6,000/year in 3 installments'
  },
  {
    id: 2,
    title: 'Rashtriya Krishi Vikas Yojana',
    description: 'Supports state governments to increase public investment in Agriculture and allied sectors.',
    eligibility: 'All farmers with minimum 1 acre land',
    matchPercent: 78,
    deadline: '2025-04-15',
    category: 'Investment',
    benefits: 'Up to ₹2 lakhs grant for farm equipment'
  },
  {
    id: 3,
    title: 'Paramparagat Krishi Vikas Yojana',
    description: 'Promotes organic farming through cluster approach. Support for organic inputs and certification.',
    eligibility: 'Farmers practicing or willing to adopt organic farming',
    matchPercent: 85,
    deadline: '2025-02-28',
    category: 'Organic Farming',
    benefits: '₹50,000 per hectare for 3 years'
  },
  {
    id: 4,
    title: 'Pradhan Mantri Krishi Sinchayee Yojana',
    description: 'Micro irrigation and water conservation schemes to improve water use efficiency.',
    eligibility: 'All farmers with irrigation needs',
    matchPercent: 71,
    deadline: '2025-05-30',
    category: 'Irrigation',
    benefits: '55% subsidy on drip/sprinkler systems'
  },
  {
    id: 5,
    title: 'Kisan Credit Card Scheme',
    description: 'Provides crop loans to farmers at subsidized interest rates for purchase of inputs.',
    eligibility: 'All farmers including tenant farmers',
    matchPercent: 96,
    deadline: 'Ongoing',
    category: 'Credit',
    benefits: 'Up to ₹3 lakhs at 4% interest p.a.'
  },
];

const mockCarbonTransactions: CarbonTransaction[] = [
  { id: 1, date: '2025-01-15', type: 'earned', amount: 2.5, description: 'Water conservation - Drip irrigation' },
  { id: 2, date: '2025-01-10', type: 'earned', amount: 1.8, description: 'Organic farming practices' },
  { id: 3, date: '2025-01-05', type: 'redeemed', amount: -3.0, description: 'Redeemed for fertilizer subsidy' },
  { id: 4, date: '2024-12-28', type: 'earned', amount: 4.2, description: 'Solar pump installation' },
  { id: 5, date: '2024-12-15', type: 'earned', amount: 1.5, description: 'Crop rotation implementation' },
];

const mockCommunityTips: CommunityTip[] = [
  { id: 1, author: 'Rajesh Kumar', avatar: 'RK', tip: 'Try drip irrigation at root zone during morning hours for 30% water savings', likes: 245, crop: 'Cotton' },
  { id: 2, author: 'Anita Devi', avatar: 'AD', tip: 'Neem oil + garlic spray works wonders against aphids without chemicals', likes: 189, crop: 'Vegetables' },
  { id: 3, author: 'Suresh Patel', avatar: 'SP', tip: 'Rotate legumes with cereals to naturally boost nitrogen levels in soil', likes: 312, crop: 'All Crops' },
  { id: 4, author: 'Meena Sundaram', avatar: 'MS', tip: 'Mulch with crop residues to reduce evaporation by up to 50% in summer', likes: 167, crop: 'Pulses' },
];

const aiResponses = [
  "Based on your sensor data, nitrogen levels are optimal. Consider adding phosphorus-rich organic compost before the next sowing cycle.",
  "Great question! For your loamy soil with current moisture at 68%, I recommend watering once every 3 days during this season.",
  "Your pH levels are slightly acidic (6.2). Adding a small amount of lime could help balance it, which would benefit your wheat crop.",
  "Looking at the 7-day forecast, there's a high chance of rain on Thursday. Consider delaying your pesticide application until after the rain.",
  "Based on community insights from farmers in your region growing similar crops, try using vermicompost at 2 tonnes per hectare for better yield.",
];

// Radial Gauge Component
const RadialGauge: React.FC<{ value: number; max: number; label: string; color: string; icon: React.ReactNode }> = ({ value, max, label, color, icon }) => {
  const percentage = Math.min((value / max) * 100, 100);
  const circumference = 2 * Math.PI * 40;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  const getStatusColor = () => {
    if (percentage < 30) return '#EF4444';
    if (percentage < 60) return '#F59E0B';
    return color;
  };

  const getStatusText = () => {
    if (percentage < 30) return 'Low';
    if (percentage < 60) return 'Moderate';
    return 'Optimal';
  };

  return (
    <div className="flex flex-col items-center p-4 bg-white rounded-2xl shadow-sm border border-gray-100">
      <div className="flex items-center gap-2 mb-3">
        <div className="p-1.5 rounded-lg" style={{ backgroundColor: `${color}15` }}>
          {icon}
        </div>
        <span className="font-semibold text-gray-700 text-sm">{label}</span>
      </div>
      <div className="relative w-28 h-28">
        <svg className="w-28 h-28 transform -rotate-90" viewBox="0 0 100 100">
          <circle
            cx="50" cy="50" r="40"
            stroke="#E5E7EB" strokeWidth="8" fill="none"
          />
          <circle
            cx="50" cy="50" r="40"
            stroke={getStatusColor()}
            strokeWidth="8"
            fill="none"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            className="transition-all duration-1000 ease-out"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-bold text-gray-800">{Math.round(value)}</span>
          <span className="text-xs text-gray-500">kg/ha</span>
        </div>
      </div>
      <span
        className="mt-2 text-xs font-medium px-2 py-0.5 rounded-full"
        style={{
          backgroundColor: percentage < 30 ? '#FEE2E2' : percentage < 60 ? '#FEF3C7' : `${color}15`,
          color: getStatusColor()
        }}
      >
        {getStatusText()}
      </span>
    </div>
  );
};

// Linear Indicator Component
const LinearIndicator: React.FC<{ value: number; min: number; max: number; label: string; unit: string; icon: React.ReactNode; optimalRange?: [number, number] }> = ({
  value, min, max, label, unit, icon, optimalRange
}) => {
  const percentage = ((value - min) / (max - min)) * 100;
  
  const isInOptimal = optimalRange ? value >= optimalRange[0] && value <= optimalRange[1] : true;
  
  const getBarColor = () => {
    if (optimalRange) {
      return isInOptimal ? '#2E7D32' : '#F59E0B';
    }
    return '#2E7D32';
  };

  return (
    <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-green-50">
            {icon}
          </div>
          <span className="font-semibold text-gray-700 text-sm">{label}</span>
        </div>
        <div className="text-right">
          <span className="text-lg font-bold text-gray-800">{value.toFixed(1)}</span>
          <span className="text-sm text-gray-500 ml-1">{unit}</span>
        </div>
      </div>
      <div className="relative">
        <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-1000 ease-out"
            style={{ width: `${percentage}%`, backgroundColor: getBarColor() }}
          />
        </div>
        {optimalRange && (
          <div className="flex justify-between mt-1 text-xs text-gray-400">
            <span>{min}</span>
            <span className="text-green-600">Optimal: {optimalRange[0]}-{optimalRange[1]}</span>
            <span>{max}</span>
          </div>
        )}
      </div>
    </div>
  );
};

// Dashboard Tab Component
const DashboardTab: React.FC<{ sensorData: SensorData }> = ({ sensorData }) => {
  return (
    <div className="pb-4">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Good Morning, Farmer 🌾</h1>
        <p className="text-gray-500 mt-1">Here's your farm health summary for today</p>
      </div>

      {/* Quick Stats Bar */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className="bg-gradient-to-br from-green-600 to-green-700 p-3 rounded-xl text-white">
          <p className="text-xs opacity-80">Soil Temp</p>
          <p className="text-xl font-bold">24°C</p>
        </div>
        <div className="bg-gradient-to-br from-amber-500 to-amber-600 p-3 rounded-xl text-white">
          <p className="text-xs opacity-80">Humidity</p>
          <p className="text-xl font-bold">65%</p>
        </div>
        <div className="bg-gradient-to-br from-sky-500 to-sky-600 p-3 rounded-xl text-white">
          <p className="text-xs opacity-80">Rain Chance</p>
          <p className="text-xl font-bold">30%</p>
        </div>
      </div>

      {/* NPK Gauges */}
      <h2 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
        <Gauge className="w-5 h-5 text-green-700" />
        Soil Nutrients (NPK)
      </h2>
      <div className="grid grid-cols-3 gap-3 mb-6">
        <RadialGauge
          value={sensorData.nitrogen}
          max={100}
          label="Nitrogen"
          color="#2E7D32"
          icon={<Leaf className="w-4 h-4 text-green-700" />}
        />
        <RadialGauge
          value={sensorData.phosphorus}
          max={100}
          label="Phosphorus"
          color="#FFA000"
          icon={<Sun className="w-4 h-4 text-amber-600" />}
        />
        <RadialGauge
          value={sensorData.potassium}
          max={100}
          label="Potassium"
          color="#0288D1"
          icon={<Sprout className="w-4 h-4 text-sky-600" />}
        />
      </div>

      {/* Linear Indicators */}
      <h2 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
        <Thermometer className="w-5 h-5 text-green-700" />
        Soil Health Indicators
      </h2>
      <div className="space-y-3 mb-6">
        <LinearIndicator
          value={sensorData.ph}
          min={0}
          max={14}
          label="pH Level"
          unit="pH"
          optimalRange={[6.0, 7.5]}
          icon={<Gauge className="w-4 h-4 text-green-700" />}
        />
        <LinearIndicator
          value={sensorData.moisture}
          min={0}
          max={100}
          label="Soil Moisture"
          unit="%"
          optimalRange={[50, 70]}
          icon={<Droplets className="w-4 h-4 text-green-700" />}
        />
      </div>

      {/* Weekly Trends Chart */}
      <h2 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
        <TrendingUp className="w-5 h-5 text-green-700" />
        Weekly Trends
      </h2>
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 mb-4">
        <ResponsiveContainer width="100%" height={200}>
          <AreaChart data={mockHistoricalData}>
            <defs>
              <linearGradient id="moistureGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#2E7D32" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#2E7D32" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#F0F0F0" />
            <XAxis dataKey="day" tick={{ fontSize: 12, fill: '#9CA3AF' }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 12, fill: '#9CA3AF' }} axisLine={false} tickLine={false} />
            <Tooltip
              contentStyle={{ borderRadius: '12px', border: '1px solid #E5E7EB', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}
            />
            <Area type="monotone" dataKey="moisture" stroke="#2E7D32" fill="url(#moistureGrad)" strokeWidth={2} name="Moisture %" />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* pH Comparison Bar Chart */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
        <h3 className="font-medium text-gray-700 mb-3 text-sm">pH & NPK Index - Weekly</h3>
        <ResponsiveContainer width="100%" height={160}>
          <BarChart data={mockHistoricalData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#F0F0F0" />
            <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#9CA3AF' }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: '#9CA3AF' }} axisLine={false} tickLine={false} />
            <Tooltip
              contentStyle={{ borderRadius: '12px', border: '1px solid #E5E7EB' }}
            />
            <Bar dataKey="ph" fill="#FFA000" radius={[4, 4, 0, 0]} name="pH Level" />
            <Bar dataKey="npk" fill="#2E7D32" radius={[4, 4, 0, 0]} name="NPK Index" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

// AI Advisor Tab Component
const AIAdvisorTab: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      text: "Hello! 👋 I'm your Agri-Smart AI Advisor. I can help you with crop recommendations, pest control, irrigation schedules, and more. How can I assist you today?",
      isUser: false,
      timestamp: new Date().toISOString()
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = useCallback(() => {
    if (!inputText.trim()) return;

    const userMessage: Message = {
      id: messages.length + 1,
      text: inputText,
      isUser: true,
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsTyping(true);

    // Simulate AI response
    setTimeout(() => {
      const aiResponse: Message = {
        id: messages.length + 2,
        text: aiResponses[Math.floor(Math.random() * aiResponses.length)],
        isUser: false,
        timestamp: new Date().toISOString()
      };
      setMessages(prev => [...prev, aiResponse]);
      setIsTyping(false);
    }, 1500);
  }, [inputText, messages.length]);

  const quickPrompts = [
    "How to improve soil fertility?",
    "Best irrigation schedule for wheat?",
    "Natural pest control methods?",
    "When to apply fertilizers?"
  ];

  return (
    <div className="flex flex-col h-full pb-4">
      {/* Header */}
      <div className="mb-4">
        <h1 className="text-2xl font-bold text-gray-900">AI Advisor 🤖</h1>
        <p className="text-gray-500 mt-1">Smart farming insights powered by AI</p>
      </div>

      {/* Community Insights - Horizontal Scroll */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-sm font-semibold text-gray-700 flex items-center gap-1.5">
            <Users className="w-4 h-4 text-green-700" />
            Community Insights
          </h2>
          <span className="text-xs text-green-600 font-medium">Proven Tips ⭐</span>
        </div>
        <div className="flex gap-3 overflow-x-auto pb-2 -mx-1 px-1">
          {mockCommunityTips.map((tip) => (
            <div
              key={tip.id}
              className="flex-shrink-0 w-64 bg-gradient-to-br from-amber-50 to-orange-50 p-3 rounded-xl border border-amber-100"
            >
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 rounded-full bg-green-600 flex items-center justify-center text-white text-xs font-bold">
                  {tip.avatar}
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-700">{tip.author}</p>
                  <p className="text-xs text-amber-600 font-medium">{tip.crop}</p>
                </div>
              </div>
              <p className="text-xs text-gray-600 leading-relaxed mb-2">"{tip.tip}"</p>
              <div className="flex items-center gap-1 text-xs text-gray-400">
                <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                <span>{tip.likes} farmers found this helpful</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto space-y-3 mb-3 min-h-0">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.isUser ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-xs p-3 rounded-2xl shadow-sm ${
                msg.isUser
                  ? 'bg-green-700 text-white rounded-br-md'
                  : 'bg-white text-gray-700 border border-gray-100 rounded-bl-md'
              }`}
            >
              {!msg.isUser && (
                <div className="flex items-center gap-1.5 mb-1.5">
                  <Bot className="w-3.5 h-3.5 text-green-600" />
                  <span className="text-xs font-semibold text-green-600">AgriSmart AI</span>
                </div>
              )}
              <p className="text-sm leading-relaxed">{msg.text}</p>
              <p className={`text-xs mt-1.5 ${msg.isUser ? 'text-green-200' : 'text-gray-400'}`}>
                {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
          </div>
        ))}
        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-white p-3 rounded-2xl rounded-bl-md border border-gray-100 shadow-sm">
              <div className="flex items-center gap-1.5">
                <Bot className="w-3.5 h-3.5 text-green-600" />
                <span className="text-xs font-semibold text-green-600">AgriSmart AI</span>
              </div>
              <div className="flex gap-1 mt-2">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <div className="w-2 h-2 bg-green-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="w-2 h-2 bg-green-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Quick Prompts */}
      <div className="flex gap-2 overflow-x-auto pb-2 mb-2">
        {quickPrompts.map((prompt, idx) => (
          <button
            key={idx}
            onClick={() => setInputText(prompt)}
            className="flex-shrink-0 px-3 py-1.5 bg-green-50 text-green-700 rounded-full text-xs font-medium border border-green-200 hover:bg-green-100 transition-colors"
          >
            💡 {prompt}
          </button>
        ))}
      </div>

      {/* Input Bar */}
      <div className="flex gap-2 items-center">
        <div className="flex-1 relative">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
            placeholder="Ask me anything about farming..."
            className="w-full px-4 py-3 pr-12 rounded-xl border border-gray-200 focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100 text-sm bg-white"
          />
        </div>
        <button
          onClick={sendMessage}
          disabled={!inputText.trim() || isTyping}
          className="p-3 bg-green-700 text-white rounded-xl hover:bg-green-800 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors shadow-lg shadow-green-700/20"
        >
          <Send className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};

// Finance Hub Tab Component
const FinanceHubTab: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'schemes' | 'wallet'>('schemes');
  const [selectedScheme, setSelectedScheme] = useState<Scheme | null>(null);

  const carbonBalance = mockCarbonTransactions.reduce((sum, t) => sum + t.amount, 0);
  const carbonValue = carbonBalance * 15; // $15 per credit

  return (
    <div className="pb-4">
      {/* Header */}
      <div className="mb-4">
        <h1 className="text-2xl font-bold text-gray-900">Finance Hub 💰</h1>
        <p className="text-gray-500 mt-1">Government schemes & carbon credits</p>
      </div>

      {/* Tab Selector */}
      <div className="flex gap-2 mb-4 bg-gray-100 p-1 rounded-xl">
        <button
          onClick={() => setActiveTab('schemes')}
          className={`flex-1 py-2.5 px-4 rounded-lg text-sm font-semibold transition-all flex items-center justify-center gap-1.5 ${
            activeTab === 'schemes'
              ? 'bg-white text-green-700 shadow-sm'
              : 'text-gray-500'
          }`}
        >
          <Shield className="w-4 h-4" />
          Govt Schemes
        </button>
        <button
          onClick={() => setActiveTab('wallet')}
          className={`flex-1 py-2.5 px-4 rounded-lg text-sm font-semibold transition-all flex items-center justify-center gap-1.5 ${
            activeTab === 'wallet'
              ? 'bg-white text-green-700 shadow-sm'
              : 'text-gray-500'
          }`}
        >
          <Wallet className="w-4 h-4" />
          Green Wallet
        </button>
      </div>

      {activeTab === 'schemes' ? (
        <div className="space-y-3">
          {/* Match Summary */}
          <div className="bg-gradient-to-r from-green-600 to-green-700 p-4 rounded-2xl text-white mb-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm opacity-80">Scheme Eligibility</p>
                <p className="text-2xl font-bold mt-0.5">{mockSchemes.length} Schemes</p>
                <p className="text-xs opacity-80 mt-1">{mockSchemes.filter(s => s.matchPercent >= 80).length} Highly Eligible</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center">
                  <Check className="w-8 h-8" />
                </div>
                <p className="text-xs mt-1">Pre-verified</p>
              </div>
            </div>
          </div>

          {mockSchemes.map((scheme) => (
            <div
              key={scheme.id}
              onClick={() => setSelectedScheme(selectedScheme?.id === scheme.id ? null : scheme)}
              className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all cursor-pointer"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1.5">
                    <span
                      className="px-2 py-0.5 rounded-full text-xs font-medium"
                      style={{
                        backgroundColor: scheme.matchPercent >= 80 ? '#D1FAE5' : '#FEF3C7',
                        color: scheme.matchPercent >= 80 ? '#166534' : '#B45309'
                      }}
                    >
                      {scheme.category}
                    </span>
                    <span className="text-xs text-gray-400 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      Deadline: {scheme.deadline}
                    </span>
                  </div>
                  <h3 className="font-semibold text-gray-800 text-sm mb-1">{scheme.title}</h3>
                  <p className="text-xs text-gray-500 leading-relaxed">{scheme.description}</p>
                </div>
                <div className="ml-3 flex flex-col items-end">
                  <div className="relative w-12 h-12">
                    <svg className="w-12 h-12 transform -rotate-90" viewBox="0 0 48 48">
                      <circle cx="24" cy="24" r="18" stroke="#E5E7EB" strokeWidth="4" fill="none" />
                      <circle
                        cx="24" cy="24" r="18"
                        stroke={scheme.matchPercent >= 80 ? '#2E7D32' : '#FFA000'}
                        strokeWidth="4"
                        fill="none"
                        strokeLinecap="round"
                        strokeDasharray={2 * Math.PI * 18}
                        strokeDashoffset={2 * Math.PI * 18 - (scheme.matchPercent / 100) * 2 * Math.PI * 18}
                      />
                    </svg>
                    <span className="absolute inset-0 flex items-center justify-center text-xs font-bold text-gray-700">
                      {scheme.matchPercent}%
                    </span>
                  </div>
                  <span className="text-xs text-gray-400 mt-1">Match</span>
                </div>
              </div>

              {/* Expanded Content */}
              {selectedScheme?.id === scheme.id && (
                <div className="mt-3 pt-3 border-t border-gray-100 animate-pulse-once">
                  <div className="grid grid-cols-2 gap-3 mb-3">
                    <div className="bg-green-50 p-3 rounded-xl">
                      <p className="text-xs text-green-600 font-medium">Benefits</p>
                      <p className="text-sm font-semibold text-gray-700 mt-0.5">{scheme.benefits}</p>
                    </div>
                    <div className="bg-amber-50 p-3 rounded-xl">
                      <p className="text-xs text-amber-600 font-medium">Eligibility</p>
                      <p className="text-sm font-semibold text-gray-700 mt-0.5">{scheme.eligibility}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button className="flex-1 py-2.5 bg-green-700 text-white rounded-xl text-sm font-semibold hover:bg-green-800 transition-colors">
                      Apply Now
                    </button>
                    <button className="px-4 py-2.5 bg-gray-100 text-gray-600 rounded-xl text-sm font-semibold hover:bg-gray-200 transition-colors">
                      <Info className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div>
          {/* Green Wallet Card */}
          <div className="bg-gradient-to-br from-green-600 via-green-700 to-emerald-800 p-5 rounded-2xl text-white mb-4 shadow-xl shadow-green-700/30">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Award className="w-6 h-6" />
                <span className="font-semibold">Green Wallet</span>
              </div>
              <div className="flex items-center gap-1 bg-white/20 px-2 py-1 rounded-lg">
                <Zap className="w-4 h-4 text-amber-300" />
                <span className="text-xs font-medium">Active</span>
              </div>
            </div>
            <div className="space-y-3">
              <div>
                <p className="text-sm opacity-80">Carbon Credits Balance</p>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="text-3xl font-bold">{carbonBalance.toFixed(1)}</span>
                  <span className="text-sm opacity-80">credits</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <ArrowUp className="w-4 h-4 text-green-200" />
                <span className="text-sm text-green-100">
                  Equivalent to ₹{carbonValue.toFixed(0)} (₹15/credit)
                </span>
              </div>
            </div>
            <div className="mt-4 flex gap-2">
              <button className="flex-1 py-2.5 bg-white text-green-700 rounded-xl text-sm font-bold hover:bg-gray-100 transition-colors flex items-center justify-center gap-1.5">
                <Gift className="w-4 h-4" />
                Redeem
              </button>
              <button className="flex-1 py-2.5 bg-white/20 text-white rounded-xl text-sm font-semibold hover:bg-white/30 transition-colors flex items-center justify-center gap-1.5">
                <TrendingUp className="w-4 h-4" />
                History
              </button>
            </div>
          </div>

          {/* Carbon Calculator */}
          <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm mb-4">
            <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
              <Calculator className="w-4 h-4 text-green-700" />
              Carbon Credit Calculator
            </h3>
            <div className="space-y-3">
              <div>
                <label className="text-xs text-gray-500 font-medium">Reduced Water Usage (Liters this month)</label>
                <input
                  type="number"
                  placeholder="e.g., 5000"
                  className="w-full mt-1.5 px-3 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-green-500 text-sm"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-green-50 p-3 rounded-xl">
                  <p className="text-xs text-green-600 font-medium">Formula</p>
                  <p className="text-xs text-gray-600 mt-1">Water Saved × 0.0005</p>
                </div>
                <div className="bg-amber-50 p-3 rounded-xl">
                  <p className="text-xs text-amber-600 font-medium">Estimated Credits</p>
                  <p className="text-lg font-bold text-gray-700">~2.5</p>
                </div>
              </div>
              <button className="w-full py-2.5 bg-green-700 text-white rounded-xl text-sm font-semibold hover:bg-green-800 transition-colors">
                Calculate & Log Credits
              </button>
            </div>
          </div>

          {/* Transaction History */}
          <h3 className="font-semibold text-gray-800 mb-3 text-sm">Transaction History</h3>
          <div className="space-y-2">
            {mockCarbonTransactions.map((txn) => (
              <div
                key={txn.id}
                className="bg-white p-3 rounded-xl border border-gray-100 flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                      txn.type === 'earned' ? 'bg-green-50' : 'bg-red-50'
                    }`}
                  >
                    {txn.type === 'earned' ? (
                      <ArrowUp className="w-5 h-5 text-green-600" />
                    ) : (
                      <ArrowDown className="w-5 h-5 text-red-500" />
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-700">{txn.description}</p>
                    <p className="text-xs text-gray-400">{txn.date}</p>
                  </div>
                </div>
                <span
                  className={`text-sm font-bold ${
                    txn.amount > 0 ? 'text-green-600' : 'text-red-500'
                  }`}
                >
                  {txn.amount > 0 ? '+' : ''}{txn.amount}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// Missing components from FinanceHub
const Gift: React.FC<{ className?: string }> = ({ className }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <rect x="3" y="8" width="18" height="4" rx="1" />
    <path d="M12 22V8" />
    <path d="M12 8H7.5A2.5 2.5 0 0 1 5 5.5A2.5 2.5 0 0 1 7.5 3c1.2 0 2.2.7 2.5 1.7" />
    <path d="M12 8h4.5A2.5 2.5 0 0 0 19 5.5A2.5 2.5 0 0 0 16.5 3c-1.2 0-2.2.7-2.5 1.7" />
  </svg>
);

const Calculator: React.FC<{ className?: string }> = ({ className }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <rect x="4" y="2" width="16" height="20" rx="2" />
    <line x1="8" y1="6" x2="16" y2="6" />
    <line x1="16" y1="14" x2="16" y2="18" />
    <path d="M16 10h.01" />
    <path d="M12 10h.01" />
    <path d="M8 10h.01" />
    <path d="M12 14h.01" />
    <path d="M8 14h.01" />
    <path d="M12 18h.01" />
    <path d="M8 18h.01" />
  </svg>
);

// Main App Component
const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'advisor' | 'finance'>('dashboard');
  const [sensorData, setSensorData] = useState<SensorData>({
    nitrogen: 72,
    phosphorus: 58,
    potassium: 65,
    ph: 6.8,
    moisture: 68,
    timestamp: new Date().toISOString()
  });
  const [lastUpdate, setLastUpdate] = useState(new Date());

  // Simulate real-time sensor updates
  useEffect(() => {
    const interval = setInterval(() => {
      setSensorData(prev => ({
        nitrogen: Math.max(40, Math.min(95, prev.nitrogen + (Math.random() - 0.5) * 8)),
        phosphorus: Math.max(35, Math.min(90, prev.phosphorus + (Math.random() - 0.5) * 6)),
        potassium: Math.max(40, Math.min(88, prev.potassium + (Math.random() - 0.5) * 5)),
        ph: Math.max(5.5, Math.min(8.0, prev.ph + (Math.random() - 0.5) * 0.3)),
        moisture: Math.max(40, Math.min(85, prev.moisture + (Math.random() - 0.5) * 5)),
        timestamp: new Date().toISOString()
      }));
      setLastUpdate(new Date());
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const tabs = [
    { id: 'dashboard' as const, label: 'Dashboard', icon: Home },
    { id: 'advisor' as const, label: 'AI Advisor', icon: Bot },
    { id: 'finance' as const, label: 'Finance', icon: CreditCard },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Top App Bar */}
      <header className="bg-white border-b border-gray-100 px-4 py-3 sticky top-0 z-50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-600 to-green-700 flex items-center justify-center shadow-lg shadow-green-700/20">
              <Leaf className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-800">Agri-Smart</h1>
              <p className="text-xs text-gray-400 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                Live • {lastUpdate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button className="p-2 hover:bg-gray-100 rounded-xl transition-colors relative">
              <Search className="w-5 h-5 text-gray-500" />
            </button>
            <button className="p-2 hover:bg-gray-100 rounded-xl transition-colors relative">
              <Bell className="w-5 h-5 text-gray-500" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
            </button>
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-400 to-amber-500 flex items-center justify-center text-white font-bold text-sm shadow-lg shadow-amber-500/20">
              RK
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto px-4 py-4">
        {activeTab === 'dashboard' && <DashboardTab sensorData={sensorData} />}
        {activeTab === 'advisor' && <AIAdvisorTab />}
        {activeTab === 'finance' && <FinanceHubTab />}
      </main>

      {/* Bottom Navigation Bar */}
      <nav className="bg-white border-t border-gray-100 px-2 py-2 sticky bottom-0 z-50">
        <div className="flex items-center justify-around">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex flex-col items-center py-2 px-4 rounded-xl transition-all ${
                  isActive
                    ? 'text-green-700 bg-green-50'
                    : 'text-gray-400 hover:text-gray-600'
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.5px]' : ''}`} />
                <span className={`text-xs mt-1 font-medium ${isActive ? 'font-semibold' : ''}`}>
                  {tab.label}
                </span>
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
};

export default App;