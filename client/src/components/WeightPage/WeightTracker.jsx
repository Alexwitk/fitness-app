import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Line } from 'react-chartjs-2';
import { Chart } from 'chart.js';
import zoomPlugin from 'chartjs-plugin-zoom';
import 'chart.js/auto';
import '../../WeightTracker.css';
import Navbar from '../Navbar/NavBar';  
import { useSelector } from 'react-redux';

Chart.register(zoomPlugin);

const WeightTracker = () => {
    const user = useSelector((state) => state.user);
    const [weights, setWeights] = useState([]);
    const [weight, setWeight] = useState('');
    const [date, setDate] = useState('');
    const [unit, setUnit] = useState('lbs');
    const [view, setView] = useState('day');
    const [endDate, setEndDate] = useState(new Date());
    const [displayUnit, setDisplayUnit] = useState('lbs');
    const [showMenu, setShowMenu] = useState(false);
    const [menuPosition, setMenuPosition] = useState({ x: 0, y: 0 });
    const [selectedDate, setSelectedDate] = useState(null);
    const chartRef = useRef(null);

    useEffect(() => {
        const id = user._id;
        const fetchWeights = async () => {
            const res = await axios.get('http://localhost:5000/weights/getWeights', {
                params: { id: id }
            });
            setWeights(res.data);
        };
        fetchWeights();
    }, [user]);

    const parseDate = (dateString) => {
        if (dateString.includes('T')) {
            return new Date(dateString);
        } else {
            const [day, month, year] = dateString.split('/');
            return new Date(`${year}-${month}-${day}`);
        }
    };

    const filterWeightsByView = () => {
        return weights.filter(entry => {
            const entryDate = parseDate(entry.date);
            switch (view) {
                case 'day':
                    return (endDate - entryDate) / (1000 * 60 * 60 * 24) <= 7; // Last 7 days
                case 'week':
                    return (endDate - entryDate) / (1000 * 60 * 60 * 24 * 7) <= 8; // Last 8 weeks
                case 'month':
                    return (endDate - entryDate) / (1000 * 60 * 60 * 24 * 30) <= 12; // Last 12 months
                default:
                    return true;
            }
        });
    };

    const onChangeWeight = e => setWeight(e.target.value);
    const onChangeDate = e => setDate(e.target.value);
    const onChangeUnit = e => setUnit(e.target.value);

    const onSubmit = async e => {
        const id = user._id;
        e.preventDefault();
        try {
            const existingWeight = weights.find(entry => {
                const entryDate = entry.date;
                return entry.user === user._id && entryDate.split('T')[0] === date;
            });
            if (existingWeight) {
                await axios.delete('http://localhost:5000/weights/deleteWeight', { data: { id, date } });
                setWeights(prevWeights => prevWeights.filter(entry => !(entry.user === id && entry.date.split('T')[0] === date)));
            }
            const res = await axios.post('http://localhost:5000/weights/addWeight', { id, weight, date, unit });
            setWeights(prevWeights => [...prevWeights, res.data]);
            setWeight('');
            setDate('');
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        console.log('Weights updated:', weights);
    }, [weights]);

    const handleViewChange = e => {
        setView(e.target.value);
    };

    const formatLabel = (date) => {
        const dateObj = parseDate(date);
        const options = { month: 'numeric', day: 'numeric', year: 'numeric' };

        switch (view) {
            case 'day':
                return `${dateObj.toLocaleDateString(undefined, options)}`;
            case 'week':
                const startOfWeek = new Date(dateObj);
                startOfWeek.setDate(dateObj.getDate() - dateObj.getDay());
                const endOfWeek = new Date(dateObj);
                endOfWeek.setDate(dateObj.getDate() + (6 - dateObj.getDay()));
                return `${startOfWeek.toLocaleDateString(undefined, options)} - ${endOfWeek.toLocaleDateString(undefined, options)}`;
            case 'month':
                return `${dateObj.toLocaleDateString(undefined, { month: 'numeric', year: 'numeric' })}`;
            default:
                return date;
        }
    };

    const convertWeight = (weight, toUnit) => {
        let convertedWeight;
        if (toUnit === 'lbs') {
            convertedWeight = weight * 2.20462; // Convert kg to lbs
        } else {
            convertedWeight = weight / 2.20462; // Convert lbs to kg
        }
        return Math.round(convertedWeight * 10) / 10; // Round to tenths place
    };

    const getLabelsForView = () => {
        let labels = [];
        switch (view) {
            case 'day':
                for (let i = 6; i >= 0; i--) {
                    const date = new Date(endDate);
                    date.setDate(endDate.getDate() - i);
                    labels.push(date.toISOString().split('T')[0]);
                }
                break;
            case 'week':
                for (let i = 7; i >= 0; i--) {
                    const date = new Date(endDate);
                    date.setDate(endDate.getDate() - i * 7);
                    labels.push(date.toISOString().split('T')[0]);
                }
                break;
            case 'month':
                for (let i = 11; i >= 0; i--) {
                    const date = new Date(endDate);
                    date.setMonth(endDate.getMonth() - i);
                    labels.push(date.toLocaleDateString(undefined, { month: 'numeric', year: 'numeric' }));
                }
                break;
            default:
                break;
        }
        return labels;
    };

    const calculateMedianWeight = (weights) => {
        if (weights.length === 0) return null;
        const sortedWeights = weights.sort((a, b) => a - b);
        const mid = Math.floor(sortedWeights.length / 2);
        return sortedWeights.length % 2 !== 0 ? sortedWeights[mid] : (sortedWeights[mid - 1] + sortedWeights[mid]) / 2;
    };

    const labels = getLabelsForView();
    const filteredWeights = filterWeightsByView();
    const onWeightKeyDown = (e) => {
        if (e.key === 'e' || e.key === '-' || e.key === 'E') {
            e.preventDefault();
        }
    };

    const data = {
        labels: labels.map(label => formatLabel(label)),
        datasets: [
            {
                label: 'Weight',
                data: labels.map(label => {
                    let relevantWeights;
                    if (view === 'day') {
                        relevantWeights = filteredWeights.filter(entry => parseDate(entry.date).toISOString().split('T')[0] === label);
                        return relevantWeights.length > 0 ? (relevantWeights[0].unit === displayUnit ? relevantWeights[0].weight : convertWeight(relevantWeights[0].weight, displayUnit)) : null;
                    } else if (view === 'week') {
                        const labelDate = parseDate(label).toISOString().split('T')[0];
                        relevantWeights = filteredWeights.filter(entry => {
                            const entryDate = parseDate(entry.date).toISOString().split('T')[0];
                            const entryTimestamp = new Date(entryDate).getTime();
                            const labelTimestamp = new Date(labelDate).getTime();
                            return entryTimestamp <= (6 * 24 * 60 * 60 * 1000) + labelTimestamp && entryTimestamp >= labelTimestamp;
                        });
                    } else if (view === 'month') {
                        const labelDate = parseDate(label);
                        relevantWeights = filteredWeights.filter(entry => {
                            const entryDate = parseDate(entry.date);
                            return entryDate.getMonth() === labelDate.getMonth() && entryDate.getFullYear() === labelDate.getFullYear();
                        });
                    }
                    return calculateMedianWeight(relevantWeights.map(entry => entry.unit === displayUnit ? entry.weight : convertWeight(entry.weight, displayUnit)));
                }),
                fill: false,
                backgroundColor: 'blue',
                borderColor: 'blue',
                pointRadius: 5,
                spanGaps: true,
            },
        ],
    };

    const toggleDisplayUnit = () => {
        setDisplayUnit(prevUnit => (prevUnit === 'kg' ? 'lbs' : 'kg'));
    };

    const diff = (Math.max(...data.datasets[0].data.filter(weight => weight !== null)) - Math.min(...data.datasets[0].data.filter(weight => weight !== null)));
    let minWeight = Math.min(...data.datasets[0].data.filter(weight => weight !== null)) - 5;
    let maxWeight = Math.max(...data.datasets[0].data.filter(weight => weight !== null)) + 5;
    if (diff !== 0) {
        minWeight = minWeight - 0.2 * diff;
        maxWeight = maxWeight + 0.2 * diff;
    }
    minWeight = Math.max(0, Math.round(minWeight * 10) / 10);
    maxWeight = Math.round(maxWeight * 10) / 10;

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                onClick: null,
            },
            tooltip: {
                enabled: true,
                callbacks: {
                    label: function (context) {
                        return `Weight: ${context.raw} ${displayUnit}`;
                    }
                }
            }
        },
        scales: {
            y: {
                min: minWeight,
                max: maxWeight,
                display: true,
                ticks: {
                    callback: function (value) {
                        return value + ' ' + displayUnit;
                    }
                }
            },
            x: {
                display: true,
                ticks: {
                    callback: function (value, index) {
                        return labels[index];
                    }
                }
            },
        },
        onClick: (e, elements, chart) => {
            if (elements.length > 0) {
                console.log(elements);
                console.log(e);
                const elementIndex = elements[0].index;
                const selectedDate = labels[elementIndex];
                const chartPosition = chart.canvas.getBoundingClientRect();
                console.log(chartPosition);
                setMenuPosition({ x: e.x, y: 300 + e.y });
                setSelectedDate(selectedDate);
                setShowMenu(true);
            }
        }
    };

    const adjustEndDate = (increment) => {
        const newEndDate = new Date(endDate);
        switch (view) {
            case 'day':
                newEndDate.setDate(newEndDate.getDate() + (7 * increment));
                break;
            case 'week':
                newEndDate.setDate(newEndDate.getDate() + (7 * 8 * increment));
                break;
            case 'month':
                newEndDate.setFullYear(newEndDate.getFullYear() + increment);
                break;
            default:
                break;
        }
        setEndDate(newEndDate);
    };

    const canClickPrevious = () => {
        switch (view) {
            case 'day':
                return new Date(endDate.getTime()) - (7 * 24 * 60 * 60 * 1000) > findSmallestDate();
            case 'week':
                return new Date(endDate.getTime()) - (8 * 7 * 24 * 60 * 60 * 1000) > findSmallestDate();
            case 'month':
                return new Date(endDate.getTime()) - (52 * 7 * 24 * 60 * 60 * 1000) > findSmallestDate();
            default:
                return true;
        }
    };

    const canClickNext = () => {
        const today = new Date();
        today.setHours(0, 0, 0, 0); 
        const endDateWithoutTime = new Date(endDate);
        endDateWithoutTime.setHours(0, 0, 0, 0);
        return endDateWithoutTime < today; 
    };

    const findSmallestDate = () => {
        if (weights.length === 0) {
            return null; 
        }

        const userWeights = weights.filter(weight => weight.user === user._id);

        if (userWeights.length === 0) {
            return null;
        }
        let smallestDate = parseDate(userWeights[0].date); // Initialize with the first date
        userWeights.forEach(entry => {
            const entryDate = parseDate(entry.date);
            if (entryDate < smallestDate) {
                smallestDate = entryDate;
            }
        });

        return smallestDate.getTime();
    };

    const handleDelete = async (range) => {
        const id = user._id;
        try {
            if (range === 'day') {
                await axios.delete('http://localhost:5000/weights/deleteWeight', { data: { id, date: selectedDate } });
                setWeights(prevWeights => prevWeights.filter(entry => !(entry.user === id && entry.date.split('T')[0] === selectedDate)));
            } else if (range === 'week') {
                const startDate = new Date(selectedDate);
                const endDate = new Date(startDate);
                endDate.setDate(endDate.getDate() + 6);
                await axios.delete('http://localhost:5000/weights/deleteWeightRange', { data: { id, startDate: startDate.toISOString(), endDate: endDate.toISOString() } });
                setWeights(prevWeights => prevWeights.filter(entry => {
                    const entryDate = parseDate(entry.date);
                    return !(entry.user === id && entryDate >= startDate && entryDate <= endDate);
                }));
            } else if (range === 'month') {
                const [month, year] = selectedDate.split('/');
                const startDate = new Date(year, month - 1, 1);
                const endDate = new Date(year, month, 1);
                await axios.delete('http://localhost:5000/weights/deleteWeightRange', { data: { id, startDate: startDate.toISOString(), endDate: endDate.toISOString() } });
                setWeights(prevWeights => prevWeights.filter(entry => {
                    const entryDate = parseDate(entry.date);
                    return !(entry.user === id && entryDate >= startDate && entryDate < endDate);
                }));
            }
            setShowMenu(false);
        } catch (err) {
            console.error(err);
        }
    };

    const handleCancel = () => {
        setShowMenu(false);
    };

    return (
        <div className="weight-tracker">
            <Navbar />
            <h2>Weight Tracker</h2>
            <form onSubmit={onSubmit}>
                <div className="form-group">
                    <input
                        type="number"
                        name="weight"
                        value={weight}
                        onChange={onChangeWeight}
                        onKeyDown={onWeightKeyDown}
                        placeholder="Weight"
                        required
                    />
                </div>
                <div className="form-group">
                    <input
                        type="date"
                        name="date"
                        value={date}
                        onChange={onChangeDate}
                        required
                    />
                </div>
                <div className="form-group">
                    <select name="unit" value={unit} onChange={onChangeUnit}>
                        <option value="kg">kg</option>
                        <option value="lbs">lbs</option>
                    </select>
                </div>
                <button type="submit">Log Weight</button>
            </form>
            <div className="view-dropdown">
                <label>Select View:</label>
                <select value={view} onChange={handleViewChange} onClick={handleCancel}>
                    <option value="day">Daily</option>
                    <option value="week">Weekly</option>
                    <option value="month">Monthly</option>
                </select>
            </div>
            <div className="weight-chart">
                <Line ref={chartRef} data={data} options={options} />
            </div>
            <div className="chart-navigation">
                <button onClick={() => adjustEndDate(-1)} disabled={!canClickPrevious()}>
                    Previous
                </button>
                <button onClick={() => adjustEndDate(1)} disabled={!canClickNext()}>
                    Next
                </button>
            </div>
            <button onClick={toggleDisplayUnit}>
                Switch to {displayUnit === 'kg' ? 'lbs' : 'kg'}
            </button>
            {showMenu && (
                <div className="menu" style={{ top: menuPosition.y, left: `${menuPosition.x}px` }}>
                    <button onClick={() => handleDelete(view)}>Delete {view}</button>
                    <button onClick={handleCancel}>Cancel</button>
                </div>
            )}
        </div>
    );
};

export default WeightTracker;
