const w = 800;
const h = 600;
const padding = 60;

let xScale;
let xAxisScale;
let yScale;
let data = [];

let canvas = d3.select('svg');
let tooltip = d3.select('#tooltip');

const fetchData = async () => {
	data = await fetch(
		'https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/cyclist-data.json'
	)
		.then((res) => res.json())
		.catch((err) => console.log(err));
	console.log(data);

	drawCanvas();
};

const drawCanvas = () => {
	canvas.attr('width', w).attr('height', h);
	generateScale();
	generateAxes();
	drawPoints();

	// Adding the y_axis labels
	canvas
		.append('g')
		.append('text')
		.attr('y', h / 2)
		.attr('x', -100)
		.attr('fill', 'black')
		.attr('font-size', '1.2em')
		.text('Time in Minutes')
		.attr('transform', `translate(-280,${h / 4}) rotate(-90)`);
};
const generateScale = () => {
	xScale = d3
		.scaleLinear()
		.domain([d3.min(data, (item) => item['Year']) - 1, d3.max(data, (item) => item['Year']) + 2])
		.range([padding, w - padding]);
	yScale = d3
		.scaleTime()
		.domain([
			d3.min(data, (item) => new Date(item['Seconds'] * 1000)),
			d3.max(data, (item) => new Date(item['Seconds'] * 1000)),
		])
		.range([padding, h - padding]);
};
const drawPoints = () => {
	canvas
		.selectAll('circle')
		.data(data)
		.enter()
		.append('circle')
		.attr('class', 'dot')
		.attr('r', '5')
		.attr('data-xvalue', (item) => item['Year'])
		.attr('data-yvalue', (item) => new Date(item['Seconds'] * 1000))
		.attr('cx', (item) => xScale(item['Year']))
		.attr('cy', (item) => yScale(new Date(item['Seconds'] * 1000)))
		.attr('fill', (item) => {
			if (item['Doping'] != '') {
				return 'blue ';
			} else {
				return 'orange';
			}
		})
		.on('mouseover', (event, item) => {
			const [x, y] = d3.pointer(event);
			tooltip
				.transition()
				.duration(100)
				.style('visibility', 'visible')
				.attr('data-year', item['Year'])
				.style('left', x + '10px')
				.style('top', y + 'px');

			if (item['Doping'] !== '') {
				tooltip.html(
					item['Name'] +
						' : ' +
						item['Nationality'] +
						'<br/>' +
						'Year: ' +
						item['Year'] +
						', ' +
						'Time: ' +
						item['Time'] +
						'<br/><br/>' +
						item['Doping']
				);
			} else {
				tooltip.html(
					item['Name'] +
						' : ' +
						item['Nationality'] +
						'<br/>' +
						'Year: ' +
						item['Year'] +
						', ' +
						'Time: ' +
						item['Time']
				);
			}
		})
		.on('mouseout', (item) => {
			tooltip.style('visibility', 'hidden');
		});
};

const generateAxes = () => {
	let xAxis = d3.axisBottom(xScale).tickFormat(d3.format('d'));
	let yAxis = d3.axisLeft(yScale).tickFormat(d3.timeFormat('%M:%S'));

	canvas
		.append('g')
		.call(xAxis)
		.attr('id', 'x-axis')
		.attr('transform', `translate(0, ${h - padding})`);

	canvas.append('g').call(yAxis).attr('id', 'y-axis').attr('transform', `translate(${padding},0)`);
};

fetchData();
