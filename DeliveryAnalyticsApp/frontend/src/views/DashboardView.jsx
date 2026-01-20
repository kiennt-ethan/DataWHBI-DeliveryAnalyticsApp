import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ShoppingCart, Truck, DollarSign, Activity, Map, Clock,
    Store, Users, MapPin, List, TrendingUp, Calendar, Map as MapIcon, Layers, ChevronDown, Check
} from 'lucide-react';
import GlassCard from '../components/common/GlassCard';
import { API_BASE } from '../utils/constants';
import { formatNum, formatMoney } from '../utils/formatters';

const DashboardView = ({ isDarkMode, t, currency }) => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('orders');

    // State bộ lọc lưu KEY (để không bị lỗi khi đổi ngôn ngữ)
    const [filters, setFilters] = useState({
        city: 'all',
        channel: 'all',
        month: 'all'
    });

    // Cấu hình danh sách lựa chọn (Dùng useMemo để tự update khi t đổi)
    const FILTER_CONFIG = useMemo(() => [
        {
            id: 'city',
            label: t.filters.city,
            icon: MapIcon,
            options: [
                { key: 'sao_paulo', label: t.filters.opt_sao_paulo },
                { key: 'rio', label: t.filters.opt_rio },
                { key: 'curitiba', label: t.filters.opt_curitiba },
                { key: 'porto', label: t.filters.opt_porto },
            ]
        },
        {
            id: 'channel',
            label: t.filters.channel,
            icon: Layers,
            options: [
                { key: 'marketplace', label: t.filters.opt_marketplace },
                { key: 'own_channel', label: t.filters.opt_own_channel },
            ]
        },
        {
            id: 'month',
            label: t.filters.month,
            icon: Calendar,
            options: [
                { key: 'jan', label: t.filters.opt_jan },
                { key: 'feb', label: t.filters.opt_feb },
                { key: 'mar', label: t.filters.opt_mar },
                { key: 'apr', label: t.filters.opt_apr },
            ]
        }
    ], [t]);

    useEffect(() => {
        axios.get(`${API_BASE}/api/dashboard/stats`)
            .then(res => setData(res.data))
            .catch(err => console.error(err))
            .finally(() => setLoading(false));
    }, []);

    if (loading) return <div className="h-[70vh] flex items-center justify-center"><div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div></div>;
    if (!data) return <div className="p-10 text-center text-red-400">Không có dữ liệu</div>;

    const TABS = [
        { id: 'orders', label: t.nav.orders, color: 'from-yellow-400 to-orange-600', icon: ShoppingCart },
        { id: 'deliveries', label: t.nav.deliveries, color: 'from-orange-400 to-red-500', icon: Truck },
        { id: 'revenue', label: t.nav.revenue, color: 'from-emerald-400 to-green-600', icon: DollarSign },
        { id: 'cost', label: t.nav.cost, color: 'from-stone-400 to-stone-600', icon: Activity },
        { id: 'distance', label: t.nav.distance, color: 'from-orange-400 to-amber-600', icon: Map },
        { id: 'time', label: t.nav.time, color: 'from-yellow-600 to-yellow-800', icon: Clock },
    ];

    return (
        <div className="space-y-6 font-sans pb-10">
            {/* 1. TOP CONTROL BAR */}
            <div className="sticky top-20 z-40 flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4">

                {/* Navigation Pills (Scrollable) */}
                <GlassCard className="p-1.5 flex gap-1 rounded-full bg-white/80 dark:bg-black/60 backdrop-blur-xl border border-gray-200 dark:border-white/10 shadow-2xl overflow-x-auto max-w-full scrollbar-hide">
                    {TABS.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`
                                flex items-center gap-2 px-4 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all duration-300 whitespace-nowrap
                                ${activeTab === tab.id
                                    ? `bg-gradient-to-r ${tab.color} text-white shadow-lg transform scale-105 ring-1 ring-white/20`
                                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/10'}
                            `}
                        >
                            <tab.icon size={14} strokeWidth={2.5} /> <span>{tab.label}</span>
                        </button>
                    ))}
                </GlassCard>

                {/* Filter Bar (Dynamic & Interactive) */}
                <GlassCard className="p-1.5 flex gap-1 rounded-full bg-white/80 dark:bg-black/60 backdrop-blur-xl border border-gray-200 dark:border-white/10 px-3 overflow-x-auto max-w-full scrollbar-hide">
                    {FILTER_CONFIG.map((conf, index) => (
                        <React.Fragment key={conf.id}>
                            <FilterDropdown
                                icon={conf.icon}
                                label={conf.label}
                                value={filters[conf.id]}
                                options={conf.options}
                                t={t}
                                onChange={(val) => setFilters({ ...filters, [conf.id]: val })}
                            />
                            {/* Divider */}
                            {index < FILTER_CONFIG.length - 1 && (
                                <div className="w-[1px] h-5 bg-gray-300 dark:bg-white/10 self-center mx-1"></div>
                            )}
                        </React.Fragment>
                    ))}
                </GlassCard>
            </div>

            {/* 2. DASHBOARD CONTENT */}
            <AnimatePresence mode="wait">
                <motion.div
                    key={`${activeTab}-${currency}-${t.nav.orders}`} // Re-render khi đổi tab, tiền, hoặc ngôn ngữ
                    initial={{ opacity: 0, y: 10, scale: 0.99 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.99 }}
                    transition={{ duration: 0.3 }}
                    className="min-h-[600px]"
                >
                    {activeTab === 'orders' && <OrdersTab data={data} t={t} />}
                    {activeTab === 'deliveries' && <DeliveriesTab data={data} t={t} />}
                    {activeTab === 'revenue' && <RevenueTab data={data} currency={currency} t={t} />}
                    {activeTab === 'cost' && <CostTab data={data} currency={currency} t={t} />}
                    {activeTab === 'distance' && <DistanceTab data={data} t={t} />}
                    {activeTab === 'time' && <TimeTab data={data} t={t} />}
                </motion.div>
            </AnimatePresence>
        </div>
    );
};

/* --- PREMIUM FILTER DROPDOWN --- */
const FilterDropdown = ({ icon: Icon, label, value, options, onChange, t }) => {
    const [isOpen, setIsOpen] = useState(false);

    // Tìm label hiển thị dựa trên value (key) hiện tại
    const currentLabel = value === 'all'
        ? `${t.filters.all} ${label}`
        : options.find(o => o.key === value)?.label || value;

    return (
        <div className="relative" onMouseLeave={() => setIsOpen(false)}>
            <button
                onMouseEnter={() => setIsOpen(true)}
                className={`
                    flex items-center gap-2 px-3 py-2 text-xs font-semibold rounded-full transition-all
                    ${value !== 'all'
                        ? 'bg-orange-500/10 text-orange-600 dark:text-orange-400 border border-orange-500/20'
                        : 'text-gray-600 dark:text-gray-300 hover:bg-black/5 dark:hover:bg-white/10'}
                `}
            >
                <Icon size={14} className={value !== 'all' ? "text-orange-500" : "text-gray-400"} />
                <span className="max-w-[100px] truncate">{currentLabel}</span>
                <ChevronDown size={12} className={`opacity-50 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* Dropdown Menu với Animation */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                        className="absolute top-full left-0 mt-2 w-48 bg-white/90 dark:bg-[#151b2b]/95 border border-gray-200 dark:border-white/10 rounded-xl shadow-2xl backdrop-blur-xl z-50 p-1.5 overflow-hidden"
                    >
                        <div className="max-h-60 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-white/10">
                            <OptionItem
                                label={t.filters.all}
                                active={value === 'all'}
                                onClick={() => { onChange('all'); setIsOpen(false); }}
                            />
                            <div className="h-[1px] bg-gray-100 dark:bg-white/5 my-1 mx-2"></div>
                            {options.map(opt => (
                                <OptionItem
                                    key={opt.key}
                                    label={opt.label}
                                    active={value === opt.key}
                                    onClick={() => { onChange(opt.key); setIsOpen(false); }}
                                />
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

const OptionItem = ({ label, active, onClick }) => (
    <button
        onClick={onClick}
        className={`
            w-full text-left px-3 py-2 text-xs rounded-lg flex justify-between items-center transition-colors
            ${active
                ? 'bg-orange-500/10 text-orange-600 dark:text-orange-400 font-bold'
                : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/10'}
        `}
    >
        {label}
        {active && <Check size={12} className="text-orange-500" />}
    </button>
);

/* --- SUB DASHBOARDS (KEEPING EXISTING STRUCTURE, JUST RENDERING) --- */
// (Giữ nguyên phần render các Tab con như OrdersTab, RevenueTab... từ code trước, 
// vì phần này đã chuẩn và chỉ phụ thuộc vào props data/t được truyền xuống)

const OrdersTab = ({ data, t }) => (
    <div className="grid grid-cols-12 gap-6 items-stretch">
        <div className="col-span-12 lg:col-span-3 flex flex-col gap-4">
            <KPICard title={t.kpi.orders} value={formatNum(data.kpi.orders)} icon={ShoppingCart} color="bg-yellow-500" />
            <KPICard title={t.kpi.channels} value={data.kpi.channels} icon={List} color="bg-green-500" />
            <KPICard title={t.kpi.stores} value={data.kpi.stores} icon={Store} color="bg-blue-500" />
            <div className="flex-1">
                <ChartCard title={t.titles.status} className="h-full">
                    <DonutChart data={data.tabs.orders.status} size={160} hole={100} />
                </ChartCard>
            </div>
        </div>
        <div className="col-span-12 lg:col-span-6 flex flex-col gap-6">
            <div className="grid grid-cols-2 gap-4 h-64">
                <ChartCard title={t.titles.channel_share} className="h-full">
                    <DonutChart data={data.tabs.orders.channel_share} size={140} hole={90} legend />
                </ChartCard>
                <ChartCard title={t.titles.product_share} className="h-full">
                    <DonutChart data={data.tabs.orders.product_share} size={140} hole={90} legend />
                </ChartCard>
            </div>
            <ChartCard title={t.titles.trend_orders} className="flex-1 min-h-[250px]">
                <WaveChart data={data.tabs.orders.trend.values} color="#F59E0B" />
            </ChartCard>
            <ChartCard title={t.titles.heatmap} className="flex-1 min-h-[200px]">
                <AreaChart data={data.tabs.orders.hourly} color="#10B981" />
            </ChartCard>
        </div>
        <div className="col-span-12 lg:col-span-3 flex flex-col gap-6">
            <ChartCard title={t.titles.top_cities} className="flex-1">
                <BarChartHorizontal data={data.tabs.orders.top_cities} color="bg-yellow-500" />
            </ChartCard>
            <ChartCard title={t.titles.dow} className="flex-1">
                <StackedBarRow data={data.tabs.orders.dow_stack} keys={['food', 'good']} colors={['#F59E0B', '#FCD34D']} />
            </ChartCard>
        </div>
    </div>
);

// ... (Copy lại các Tab DeliveriesTab, RevenueTab... từ câu trả lời trước đó vào đây) ...
// Để ngắn gọn, tôi sẽ viết tiếp các Tab còn lại ở dạng rút gọn, bạn hãy đảm bảo copy đủ code cũ vào đây nhé.

const DeliveriesTab = ({ data, t }) => (
    <div className="grid grid-cols-12 gap-6 items-stretch">
        <div className="col-span-12 lg:col-span-3 flex flex-col gap-4">
            <KPICard title={t.kpi.deliveries} value={formatNum(data.kpi.deliveries)} icon={Truck} color="bg-orange-500" />
            <KPICard title={t.kpi.drivers} value={formatNum(data.kpi.drivers)} icon={Users} color="bg-cyan-500" />
            <KPICard title={t.kpi.hubs} value={data.kpi.hubs} icon={MapPin} color="bg-indigo-500" />
            <ChartCard title={t.titles.vehicle} className="flex-1">
                <DonutChart data={data.tabs.deliveries.vehicle} size={140} hole={80} legend />
            </ChartCard>
        </div>
        <div className="col-span-12 lg:col-span-5 flex flex-col gap-6">
            <ChartCard title={t.titles.trend_del} className="flex-1">
                <WaveChart data={data.tabs.deliveries.trend} color="#22D3EE" />
            </ChartCard>
            <div className="grid grid-cols-2 gap-4 flex-1">
                <ChartCard title={t.titles.hourly_dist} className="h-full">
                    <AreaChart data={data.tabs.deliveries.hourly} color="#06B6D4" />
                </ChartCard>
                <ChartCard title={t.titles.driver_type} className="h-full">
                    <DonutChart data={data.tabs.deliveries.driver_type} size={100} hole={0} legend />
                </ChartCard>
            </div>
        </div>
        <div className="col-span-12 lg:col-span-4 flex flex-col gap-6">
            <ChartCard title={t.titles.top_hubs} className="flex-1">
                <BarChartVertical data={data.tabs.deliveries.top_hubs} color="bg-teal-500" />
            </ChartCard>
            <ChartCard title={t.titles.waterfall_city} className="flex-1">
                <WaterfallChart data={data.tabs.deliveries.waterfall_city} />
            </ChartCard>
        </div>
    </div>
);

const RevenueTab = ({ data, currency, t }) => (
    <div className="grid grid-cols-12 gap-6 items-stretch">
        <div className="col-span-12 lg:col-span-3 flex flex-col gap-6">
            <KPICard title={t.kpi.revenue} value={formatMoney(data.kpi.revenue, currency)} icon={DollarSign} color="bg-green-600" big />
            <ChartCard title={t.titles.top_stores} className="flex-1">
                <BarChartHorizontal data={data.tabs.revenue.top_stores} color="bg-emerald-500" format={v => v + 'M'} />
            </ChartCard>
        </div>
        <div className="col-span-12 lg:col-span-6 flex flex-col gap-6">
            <div className="grid grid-cols-2 gap-4 h-64">
                <ChartCard title={t.titles.product_share} className="h-full">
                    <DonutChart data={data.tabs.revenue.pie_product} size={120} hole={80} legend />
                </ChartCard>
                <ChartCard title={t.titles.channel_share} className="h-full">
                    <DonutChart data={data.tabs.revenue.pie_channel} size={120} hole={80} legend />
                </ChartCard>
            </div>
            <ChartCard title={t.titles.trend_rev} className="flex-1">
                <AreaChart data={data.tabs.revenue.trend} color="#10B981" />
            </ChartCard>
            <ChartCard title={t.titles.payment} className="h-32">
                <TreeMap data={data.tabs.revenue.payment} />
            </ChartCard>
        </div>
        <div className="col-span-12 lg:col-span-3 flex flex-col gap-6">
            <ChartCard title={t.titles.top_5_channels || "Top 5 Kênh Bán"} className="flex-1">
                <BarChartHorizontal data={data.tabs.revenue.top_channels} color="bg-green-600" format={v => v + 'M'} />
            </ChartCard>
            <ChartCard title={t.titles.revenue_city_type || "Doanh thu TP & Loại"} className="flex-1">
                <StackedBarRow data={data.tabs.revenue.city_stack} keys={['food', 'good']} colors={['#10B981', '#6EE7B7']} />
            </ChartCard>
        </div>
    </div>
);

const CostTab = ({ data, currency, t }) => (
    <div className="grid grid-cols-12 gap-6 items-stretch">
        <div className="col-span-12 lg:col-span-4 flex flex-col gap-6">
            <div className="flex gap-4">
                <KPICard title={t.kpi.cost} value={formatMoney(data.kpi.cost, currency)} icon={Activity} color="bg-stone-600" />
                <KPICard title={t.kpi.avg_cost} value={formatMoney(data.tabs.cost.avg_cost, currency)} icon={TrendingUp} color="bg-yellow-600" />
            </div>
            <ChartCard title={t.titles.cost_city} className="flex-1">
                <DonutChart data={data.tabs.cost.pie_city} size={180} hole={100} legend />
            </ChartCard>
            <ChartCard title={t.titles.cost_channel} className="flex-1">
                <DonutChart data={data.tabs.cost.pie_channel} size={140} hole={0} legend />
            </ChartCard>
        </div>
        <div className="col-span-12 lg:col-span-8 flex flex-col gap-6">
            <div className="grid grid-cols-2 gap-6 h-64">
                <ChartCard title={t.titles.cost_trend} className="h-full">
                    <WaveChart data={data.tabs.cost.trend} labels={[]} color="#78716C" />
                </ChartCard>
                <ChartCard title={t.titles.cost_driver} className="h-full">
                    <div className="space-y-4 h-full justify-center flex flex-col">
                        {data.tabs.cost.bar_driver.map((d, i) => (
                            <div key={i} className="flex flex-col gap-1">
                                <span className="text-xs text-gray-500 dark:text-gray-400 font-bold">{d.name}</span>
                                <div className="flex gap-1 h-6">
                                    <div style={{ flex: d.val1 }} className="bg-stone-500 rounded-l-sm flex items-center justify-center text-[10px] text-white font-bold">
                                        {formatMoney(d.val1, currency)}
                                    </div>
                                    <div style={{ flex: d.val2 }} className="bg-yellow-600 rounded-r-sm flex items-center justify-center text-[10px] text-white font-bold">
                                        {formatMoney(d.val2, currency)}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </ChartCard>
            </div>
            <ChartCard title={t.titles.waterfall_profit} className="flex-1">
                <WaterfallChart data={data.tabs.cost.waterfall} currency={currency} />
            </ChartCard>
            <ChartCard title={t.titles.cost_dist} className="h-48">
                <div className="relative h-full">
                    <div className="absolute inset-0"><WaveChart data={data.tabs.cost.line_dist.food} color="#F59E0B" /></div>
                    <div className="absolute inset-0 opacity-60"><WaveChart data={data.tabs.cost.line_dist.good} color="#8B5CF6" /></div>
                </div>
            </ChartCard>
        </div>
    </div>
);

const DistanceTab = ({ data, t }) => (
    <div className="grid grid-cols-12 gap-6 items-stretch">
        <div className="col-span-12 lg:col-span-3 flex flex-col gap-6">
            <KPICard title={t.kpi.avg_dist} value={formatNum(data.kpi.avg_dist)} unit={t.units.m} icon={Map} color="bg-amber-500" big />
            <ChartCard title={t.titles.dist_share} className="flex-1">
                <div className="h-full flex items-center justify-center">
                    <DonutChart data={data.tabs.distance.pie_dist} size={200} hole={140} legend />
                </div>
            </ChartCard>
        </div>
        <div className="col-span-12 lg:col-span-5 flex flex-col gap-6">
            <ChartCard title={t.titles.dist_vehicle} className="flex-1">
                <div className="h-full flex flex-col justify-center">
                    <BarChartHorizontal data={data.tabs.distance.bar_vehicle} color="bg-orange-500" format={v => v + 'M'} height="h-6" />
                </div>
            </ChartCard>
            <ChartCard title={t.titles.dist_provider} className="flex-1">
                <div className="h-full flex flex-col justify-center">
                    <StackedBarRow data={data.tabs.distance.stacked_dist} keys={['vals']} colors={['#F59E0B']} singleRow={false} height="h-8" />
                </div>
            </ChartCard>
        </div>
        <div className="col-span-12 lg:col-span-4 flex flex-col gap-6">
            <ChartCard title={t.titles.dist_city} className="h-[400px]">
                <BarChartVertical data={data.tabs.distance.bar_city} color="bg-amber-600" />
            </ChartCard>
            <ChartCard title={t.titles.top_driver_dist} className="flex-1">
                <div className="h-full flex flex-col justify-center">
                    <BarChartHorizontal data={data.tabs.distance.top_driver} color="bg-orange-400" format={v => v + 'M'} height="h-4" />
                </div>
            </ChartCard>
        </div>
    </div>
);

const TimeTab = ({ data, t }) => (
    <div className="grid grid-cols-12 gap-6 items-stretch">
        <div className="col-span-12 lg:col-span-4 flex flex-col gap-6">
            <div className="grid grid-cols-2 gap-4">
                <KPICard title={t.kpi.avg_prep} value={data.kpi.avg_prep} unit={t.units.min} icon={Clock} color="bg-yellow-600" />
                <KPICard title={t.kpi.avg_del} value={data.kpi.avg_del} unit={t.units.min} icon={Truck} color="bg-orange-600" />
            </div>
            <ChartCard title={t.titles.time_share} className="flex-1">
                <DonutChart data={data.tabs.time.pie_ratio} size={180} hole={0} legend />
            </ChartCard>
        </div>
        <div className="col-span-12 lg:col-span-8 flex flex-col gap-6">
            <div className="grid grid-cols-2 gap-6 flex-1">
                <ChartCard title={t.titles.top_store_prep} className="h-full">
                    <BarChartHorizontal data={data.tabs.time.top_store} color="bg-yellow-500" />
                </ChartCard>
                <ChartCard title={t.titles.top_driver_del} className="h-full">
                    <BarChartHorizontal data={data.tabs.time.top_driver} color="bg-orange-500" />
                </ChartCard>
            </div>
            <ChartCard title={t.titles.time_compare} className="h-64">
                <div className="flex justify-around items-end h-full pb-4">
                    {data.tabs.time.bar_city.map((c, i) => (
                        <div key={i} className="flex flex-col items-center gap-1">
                            <div className="flex items-end gap-1 h-40">
                                <div style={{ height: `${c.prep / 2}px` }} className="w-8 bg-yellow-500 rounded-t-md" title="Prep"></div>
                                <div style={{ height: `${c.del / 2}px` }} className="w-8 bg-orange-600 rounded-t-md" title="Del"></div>
                            </div>
                            <span className="text-[10px] text-gray-500 dark:text-gray-400 font-bold">{c.name}</span>
                        </div>
                    ))}
                </div>
            </ChartCard>
        </div>
    </div>
);

// --- HELPER COMPONENTS (Visual & Colors) ---

const ChartCard = ({ title, children, className = "" }) => (
    <GlassCard className={`p-5 flex flex-col w-full hover:border-orange-500/30 transition-colors ${className}`}>
        <h4 className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-4 border-b border-gray-200 dark:border-white/5 pb-2 shrink-0">{title}</h4>
        <div className="flex-1 w-full relative min-h-0">
            {children}
        </div>
    </GlassCard>
);

const KPICard = ({ title, value, unit, icon: Icon, color, big }) => (
    <GlassCard className={`relative overflow-hidden flex items-center justify-between shrink-0 ${big ? 'p-8 h-40' : 'p-5 h-28'}`}>
        <div className="z-10">
            <p className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-1">{title}</p>
            <div className={`${big ? 'text-4xl' : 'text-2xl'} font-black text-gray-900 dark:text-white tracking-tighter drop-shadow-sm`}>
                {value} {unit && <span className="text-sm font-medium text-gray-500 dark:text-gray-400 ml-1">{unit}</span>}
            </div>
        </div>
        <div className={`flex items-center justify-center ${big ? 'w-14 h-14' : 'w-10 h-10'} rounded-xl ${color} shadow-lg shadow-black/10 dark:shadow-black/20 z-10`}>
            <Icon size={big ? 28 : 18} className="text-white" />
        </div>
        <div className={`absolute -right-5 -bottom-5 w-24 h-24 rounded-full ${color} opacity-5 dark:opacity-10 blur-xl`}></div>
    </GlassCard>
);

const WaterfallChart = ({ data, currency }) => {
    if (!data) return null;
    return (
        <div className="flex items-end justify-center h-full w-full gap-3 pb-2">
            {data.map((d, i) => {
                const h = Math.abs(d.value) / 3000;
                const isPos = d.value > 0;
                const isTotal = d.type === 'total';
                const color = isTotal ? 'bg-teal-500' : (d.name === 'Total' ? 'bg-teal-500' : (isPos ? 'bg-green-500' : 'bg-red-500'));

                return (
                    <div key={i} className="flex flex-col items-center gap-2 group h-full justify-end flex-1">
                        <span className={`text-[9px] font-bold ${isPos ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'} opacity-0 group-hover:opacity-100 transition-opacity absolute -mt-4`}>
                            {currency ? formatMoney(d.value, currency) : formatNum(d.value)}
                        </span>
                        <div style={{ height: `${Math.max(10, Math.min(h, 100))}%` }} className={`w-full rounded-sm ${color} bg-opacity-90 group-hover:bg-opacity-100 transition-all shadow-sm relative`}>
                            {i > 0 && !isTotal && <div className="absolute top-0 -left-1/2 w-1/2 h-[1px] bg-gray-400 dark:bg-gray-500/30 border-t border-dashed"></div>}
                        </div>
                        <span className="text-[8px] text-gray-600 dark:text-gray-500 w-full text-center truncate font-bold">{d.name}</span>
                    </div>
                )
            })}
        </div>
    );
};

const DonutChart = ({ data, size, hole, legend }) => {
    if (!data) return null;
    const total = data.reduce((a, b) => a + (b.value || 0), 0);
    let angle = 0;
    return (
        <div className="flex items-center justify-center gap-6 h-full">
            <div className="relative shrink-0" style={{ width: size, height: size }}>
                <svg viewBox="0 0 100 100" className="transform -rotate-90 w-full h-full drop-shadow-md">
                    {data.map((d, i) => {
                        const p = d.value / total;
                        const dash = p * 314;
                        const circle = <circle key={i} cx="50" cy="50" r="40" fill="transparent" stroke={d.color || '#ccc'} strokeWidth="16" strokeDasharray={`${dash} 314`} strokeDashoffset={-angle * 314} className="transition-all duration-1000" />;
                        angle += p;
                        return circle;
                    })}
                    {hole > 0 && <circle cx="50" cy="50" r={40 - 16 / 2} fill="transparent" />}
                </svg>
                {hole > 0 && <div className="absolute inset-0 flex items-center justify-center text-xl font-black text-gray-800 dark:text-white">{data[0]?.value}%</div>}
            </div>
            {legend && <div className="space-y-2">{data.map((d, i) => (
                <div key={i} className="flex items-center gap-2 text-[10px] text-gray-600 dark:text-gray-300 font-bold">
                    <div className="w-3 h-3 rounded-full shadow-sm" style={{ backgroundColor: d.color, color: d.color }}></div>
                    {d.name}
                </div>
            ))}</div>}
        </div>
    );
};

const BarChartHorizontal = ({ data, color, format, height = "h-2" }) => {
    const max = Math.max(...data.map(d => d.value)) || 1;
    return (
        <div className="w-full h-full flex flex-col justify-center space-y-4">
            {data.map((d, i) => (
                <div key={i} className="flex items-center gap-3">
                    <span className="text-[10px] text-gray-600 dark:text-gray-400 w-16 truncate text-right shrink-0">{d.name}</span>
                    <div className={`flex-1 ${height} bg-gray-200 dark:bg-gray-800 rounded-full overflow-hidden`}>
                        <motion.div initial={{ width: 0 }} animate={{ width: `${(d.value / max) * 100}%` }} transition={{ duration: 1, delay: i * 0.05 }} className={`h-full ${color} shadow-sm`}></motion.div>
                    </div>
                    <span className="text-[10px] text-gray-800 dark:text-white font-mono w-12 text-right shrink-0 font-bold">
                        {format ? format(d.value) : formatNum(d.value)}
                    </span>
                </div>
            ))}
        </div>
    );
};

const BarChartVertical = ({ data, color }) => {
    const max = Math.max(...data.map(d => d.value)) || 1;
    return (
        <div className="flex items-end justify-between h-full w-full px-2 gap-4">
            {data.map((d, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-2 group h-full justify-end">
                    <span className="text-[10px] font-bold text-gray-800 dark:text-white opacity-0 group-hover:opacity-100 transition-opacity bg-white/90 dark:bg-black/80 px-2 py-1 rounded mb-1 shadow-sm border border-gray-200 dark:border-white/10">{formatNum(d.value)}</span>
                    <div className="w-full h-full max-h-[85%] flex items-end bg-gray-200 dark:bg-gray-800/30 rounded-t-md relative">
                        <motion.div initial={{ height: 0 }} animate={{ height: `${(d.value / max) * 100}%` }} transition={{ duration: 1, delay: i * 0.1 }} className={`w-full absolute bottom-0 rounded-t-md ${color} opacity-90 group-hover:opacity-100 transition-all shadow-sm`} />
                    </div>
                    <span className="text-[9px] text-gray-600 dark:text-gray-500 font-bold w-full text-center h-4 overflow-hidden">{d.name}</span>
                </div>
            ))}
        </div>
    );
};

const StackedBarRow = ({ data, keys, colors, singleRow, height = "h-3" }) => {
    if (singleRow) {
        return (
            <div className="w-full h-full flex flex-col justify-center gap-6">
                {data.map((row, i) => (
                    <div key={i} className="space-y-2">
                        <div className="flex justify-between">
                            <span className="text-xs text-gray-600 dark:text-gray-400 font-bold">{row.name}</span>
                        </div>
                        <div className={`flex ${height} rounded-full overflow-hidden bg-gray-200 dark:bg-gray-800 border border-gray-300 dark:border-white/5`}>
                            {row.vals.map((v, idx) => (
                                <div key={idx} style={{ flex: v, backgroundColor: ['#FCD34D', '#F59E0B', '#D97706', '#B45309', '#78350F'][idx] }} className="h-full border-r border-white/20 dark:border-black/10 relative group">
                                    <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-20 transition-opacity"></div>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        )
    }
    return (
        <div className="w-full h-full flex flex-col justify-center space-y-3">
            {data.map((row, i) => {
                const total = keys.reduce((a, k) => a + row[k], 0);
                return (
                    <div key={i} className="flex items-center gap-3">
                        <span className="text-xs text-gray-600 dark:text-gray-400 w-8 font-bold">{row.day}</span>
                        <div className="flex-1 h-3 flex rounded-full overflow-hidden bg-gray-200 dark:bg-gray-800">
                            {keys.map((k, idx) => (
                                <div key={k} style={{ width: `${(row[k] / total) * 100}%`, backgroundColor: colors[idx] }} className="h-full relative group">
                                    <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-20 transition-opacity"></div>
                                </div>
                            ))}
                        </div>
                    </div>
                )
            })}
        </div>
    );
};

const WaveChart = ({ data, labels, color }) => {
    if (!data || data.length === 0) return null;
    const max = Math.max(...data); const min = Math.min(...data);
    const pts = data.map((v, i) => `${(i / (data.length - 1)) * 100},${100 - ((v - min) / (max - min || 1)) * 100}`).join(' ');
    return (
        <div className="w-full h-full min-h-[100px] relative">
            <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="w-full h-full overflow-visible">
                <path d={`M ${pts}`} fill="none" stroke={color} strokeWidth="2" vectorEffect="non-scaling-stroke" />
                <path d={`M ${pts} L 100,100 L 0,100 Z`} fill={color} fillOpacity="0.15" />
                {data.map((v, i) => (
                    <circle key={i} cx={(i / (data.length - 1)) * 100} cy={100 - ((v - min) / (max - min || 1)) * 100} r="1.5" fill="white" className="opacity-0 hover:opacity-100 transition-opacity cursor-pointer" />
                ))}
            </svg>
        </div>
    );
};

const AreaChart = ({ data, color }) => {
    if (!data) return null;
    const max = Math.max(...data);
    const pts = data.map((v, i) => `${(i / (data.length - 1)) * 100},${100 - (v / max) * 100}`).join(' ');
    return (
        <div className="w-full h-full min-h-[100px] relative">
            <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="w-full h-full">
                <path d={`M 0,100 ${pts.split(' ').map(p => 'L ' + p).join(' ')} L 100,100 Z`} fill={color} fillOpacity="0.5" />
                <path d={`M 0,100 ${pts.split(' ').map(p => 'L ' + p).join(' ')}`} fill="none" stroke={color} strokeWidth="1.5" vectorEffect="non-scaling-stroke" />
            </svg>
        </div>
    );
};

const TreeMap = ({ data }) => (
    <div className="w-full h-full flex rounded-xl overflow-hidden border border-gray-300 dark:border-white/5 shadow-inner">
        {data.map((d, i) => (
            <div key={i} style={{ width: `${d.value}%`, backgroundColor: d.color }} className="h-full flex items-center justify-center relative group cursor-pointer">
                <span className="text-[10px] font-bold text-white group-hover:scale-125 transition-transform z-10 drop-shadow-md">{d.name}</span>
                <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-10 transition-opacity"></div>
            </div>
        ))}
    </div>
);

export default DashboardView;