---
layout: page
permalink: /cars/
title: cars
description: I led a team that built really efficient cars
nav: true
nav_order: 2
---

<div class="row">
    <div class="col-sm mt-3 mt-md-0">
        {% include figure.html path="assets/img/wr2018.jpg" title="World Record 2018" class="img-fluid rounded z-depth-1" %}
    </div>
</div>
<div class="caption">
    Maxwell and the world record team. It holds the Guinness World Record for Most Fuel-Efficient Vehicle at 14,573 MPGe.
</div>

During my undergrad at Duke, I was a part of [Duke Electric Vehicles](http://www.duke-ev.org/), a club that built electric vehicles to push the frontier of fuel efficiency. We were a completely student-led team of 15 undergrads. Our team competed in the [Shell Eco-Marathon](https://en.wikipedia.org/wiki/Shell_Eco-marathon), where 100 teams annually compete to carry a driver a fixed distance using the smallest amount of fuel. These vehicles stretch the definition of a "car", and often only have three wheels are are just big enough to fit a small driver lying down. They have a limited top speed and no suspension. However, they push the absolute extreme of what is possible to build. While normal passenger cars often get 20-40 miles per gallon (MPG), these vehicles often get efficiencies above 1000 MPG.

<div class="row">
    <div class="col-sm mt-3 mt-md-0 text-center">
        {% include figure.html path="assets/img/cnc.jpg" title="CNC dry milling at 300 ipm" class="img-fluid rounded z-depth-1" width="70%" %}
    </div>
</div>
<div class="caption">
    CNC milling parts of the car's wheel mounts. I developed a reputation for pushing the mill hard and running parts quickly, which usually ended well.
</div>

I joined the team during my first year at Duke. I worked on the vehicle's motor controller. This is a piece of power electronics that switches the DC from the battery to 3-phase AC for the vehicle's motor. Power electronics often blow up when things go wrong, which makes development an interesting process. During my third year, I was promoted to become the president of the team, where I took charge of the overall design of the car, management of the finances, and leadership of the team.


<div class="row">
    <div class="col-sm mt-3 mt-md-0 text-center">
        {% include figure.html path="assets/img/car_progress.jpg" title="Maxwell build process" class="img-fluid rounded z-depth-1" %}
    </div>
</div>
<div class="caption">
    The design and construction of Maxwell, our first world-record holder.
</div>

As the new president in my third year, we got a blank slate when designing our next car, Maxwell. I led a push to increase the vehicle's efficiency to a new level. The vehicle's shape was optimized using CFD to reduce drag, and the weight was minimized using stress simulations. We developed techniques to build the car more precisely to minimize tolerances. The resulting product was sufficient to win the 2017 Shell Eco-Marathon, where our team placed first in the electric vehicle category.

<div class="row">
    <div class="col-sm mt-3 mt-md-0 text-center">
        {% include figure.html path="assets/img/ecomarathon_2017.jpg" title="2017 Eco-Marathon win" class="img-fluid rounded z-depth-1" width="70%" %}
    </div>
</div>
<div class="caption">
    The team after winning the 2017 Eco-Marathon with Maxwell, our electric car.
</div>

In my last year at Duke, we focused on building the team's first hydrogen-powered vehicle. While we had zero experience with hydrogen fuel cells, we dove headfirst into figuring it out. Due to the efficiency of the vehicles, the power requirement from the fuel cell was fairly low, <100 watts, making development easier. We also designed and built an active hybrid system, where the fuel cell would charge a supercapacitor bank which powered the motor. This hybrid system allowed the fuel cell to continously operate in its most efficient range while the power demanded by the motor could fluctuate. Our innovations in the hydrogen-powered car were sufficient to win the 2018 Eco-Marathon in both the hydrogen-powered and electric-powered categories, in addition to a technical innovation award.

<div class="row">
    <div class="col-sm mt-3 mt-md-0 text-center">
        {% include figure.html path="assets/img/dev_team_2018.jpg" title="2018 Eco-Marathon win" class="img-fluid rounded z-depth-1" width="70%" %}
    </div>
</div>
<div class="caption">
    The team and vehicles that won the 2018 Eco-Marathon in both the hydrogen-powered and electric-powered categories.
</div>


While I had graduated at this point, based on the performance we had seen at the end of the year, we thought that breaking a world record might be possible. The previous world record was held by PAC-CAR II from ETH Zurich in Switzerland. Their team built a hydrogen-powered vehicle at an efficiency of 12,600 MPGe. A few other students and I decided to stick around campus for the summer to see what we could do. We decided to make Maxwell our world record contender, and modified it to use a hydrogen fuel cell.

<div class="row">
    <div class="col-sm mt-3 mt-md-0">
        {% include figure.html path="assets/img/maxwell_wind_tunnel.jpg" title="Maxwell during wind tunnel tests" class="img-fluid rounded z-depth-1" %}
    </div>
</div>
<div class="caption">
    Maxwell during wind tunnel testing.
</div>

Over the summer, I led a major push to quantify the energy losses in the vehicle. It's obvious that there are various sources of drag, such as air resistance, motor losses, and wheel bearing drag. However, what is the significance of each one? What should we as a team invest effort into improving? How close is our real-world implementation to the theoretical efficiency stated on the datasheets? These are all critical questions, and if we were to break a world record, we needed to understand exactly where each Joule of energy went.

We decided to attack this problem by building testing rigs to measure each part of the vehicle in isolation, then perform real-world track tests. Ideally, we could make the bottom-up efficiency estimate and top-down on-track performance match closely. By having setups to measure each component's performance on the bench, we could also get much more repeatable measurements. For example, we found that the aerodynamic drag from the wheel spokes spinning inside the car was 150 milliwatts. An unacceptable amount!

<div class="row">
    <div class="col-sm mt-3 mt-md-0">
        {% include figure.html path="assets/img/testing_setups.jpg" title="Some of the testing setups used" class="img-fluid rounded z-depth-1" %}
    </div>
</div>
<div class="caption">
    Some of the many testing setups used to evaluate the car's performance in isolation. From right to left: wind tunnel testing, measuring wheel aerodynamic drag, mapping the course with centimeter precision, measuring the overall powertrain efficiency, calibrating tire toe angle, measuring rolling resistance.
</div>


<div class="row">
    <div class="col-sm mt-3 mt-md-0 text-center">
        {% include figure.html path="assets/img/pie.png" title="Pie chart of losses" class="img-fluid rounded z-depth-1" %}
    </div>
</div>
<div class="caption">
    The totalized losses of the vehicle
</div>