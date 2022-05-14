### D3.js Force-directed graph


This graph shows US Senators and their committee memberships.

* Circle colour indicates party affiliation.
* Circle size indicates total number of committee memberships for senator
* Lines join senators that share committee memberships


Upgrades over course material:

* Responsive design
* Zebra striping on committee selections
* Circle radius derived from number of committee memberships
* Collision avoidance (no overlapping circles)
* Edge detection (circles cannot drift outside SVG boundaries)
* Legend for circle colours
* Transitions:
	* when circles are removed, they shrink and disappear
	* when circles are re-added, they grow and take on final colour
* ...
* Bug fix: Removing committees from selection should **not** removed that
committee from the tool tip: the senator is still a member of, say, 3
committees even if only one of them is displayed.


Live site: http://bclug.ca:8008/d3/force-directed/ron/
