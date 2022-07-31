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
	drawLegend();
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
			tooltip
				.transition()
				.duration(200)
				.style('visibility', 'visible')
				.attr('data-year', item['Year'])
				.style('left', event.pageX + 10 + 'px')
				.style('top', event.pageY + 'px');

			if (item['Doping'] !== '') {
				// has a doping allegation
				tooltip
					.html(
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
					)
					.style('background-color', 'rgba(112, 112, 248,0.9)');
			} else {
				tooltip
					.html(
						item['Name'] +
							' : ' +
							item['Nationality'] +
							'<br/>' +
							'Year: ' +
							item['Year'] +
							', ' +
							'Time: ' +
							item['Time']
					)
					.style('background-color', 'rgba(248, 202, 117, 0.9)');
			}
		})
		.on('mouseout', (item) => {
			tooltip.style('visibility', 'hidden');
		});
};

const drawLegend = () => {
	canvas
		.append('rect')
		.attr('x', 700)
		.attr('y', 200)
		.attr('width', 15)
		.attr('height', 15)
		.style('fill', 'blue');
	canvas
		.append('rect')
		.attr('x', 700)
		.attr('y', 218)
		.attr('width', 15)
		.attr('height', 15)
		.style('fill', 'orange');

	canvas.append('text').attr('x', 570).attr('y', 210).text('Doping Allegations');
	canvas.append('text').attr('x', 546).attr('y', 230).text('No Doping Allegations');
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
