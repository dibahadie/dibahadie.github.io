---
layout: notebook
is_cover: false
notebook_id: "computer-eng"
notebook_title: "Computer Engineering Topics"
title: "Basics of Computer Networks"
order: 1
custom_css: notebook_layout
category: "Computer Engineering"
---

# Basics of Computer Networks

Whether you are streaming a movie, sending an email, or reading this blog post, you are relying on a massive, complex, and invisible infrastructure: the Internet. But how does it actually work? Let's dive into the foundational concepts of computer networks, breaking down the hardware, the software, and the rules that keep the digital world spinning.

---

## 1. What is the Internet? Two Perspectives

We can look at the Internet through two distinct lenses: the physical hardware (nuts and bolts) and the software services it provides.

### The "Nuts and Bolts" View
Physically, the Internet is a **"network of networks."** It is a sprawling web of interconnected Internet Service Providers (ISPs) that link billions of devices together.
*   **Hosts (End Systems):** These are the devices running network applications at the "edge" of the Internet—your smartphone, laptop, smart fridge, or a massive server in a Google data center.
*   **Packet Switches:** Devices like **routers** and **switches** that act as digital traffic cops, forwarding chunks of data (called packets) toward their destinations.
*   **Communication Links:** The physical roads the data travels on, including fiber-optic cables, copper wires, radio waves, and satellite links. 
*   **Bandwidth:** The transmission rate of these links, dictating how much data can flow through per second.
*   **Standards:** Organizations like the IETF (Internet Engineering Task Force) define the rules of the road using documents called RFCs (Request for Comments). 

### The "Services" View
From a software perspective, the Internet is an **infrastructure that provides services to applications**. 
*   It provides a programming interface for distributed applications (like web browsers, multiplayer games, and email clients).
*   It offers "hooks" that allow these applications to connect to the network and choose specific service options, much like choosing between standard or express delivery at a post office.

---

## 2. What is a Protocol?

Imagine two people meeting: one puts out their hand, and the other shakes it. That’s a human protocol. In networking, **protocols** are the strict rules that govern all communication between computers and devices. 

> **Definition:** Protocols define the format and order of messages sent and received among network entities, as well as the specific actions taken upon message transmission or receipt.

Without protocols like HTTP (for the Web) or IP (for routing), the Internet would be a chaotic mess of unrecognizable electrical signals.

---

## 3. Network Structure: From the Edge to the Core

### The Network Edge
The edge of the network is where the users are. It consists of the **hosts** (clients and servers). Modern servers are rarely standalone machines; they are usually clustered by the thousands in massive high-bandwidth **data centers**.

To connect these edge devices to the broader Internet, we use **access networks**:
*   **Cable-based Access:** Uses Hybrid Fiber Coax (HFC) to transmit data and TV signals at different frequencies over a shared cable. Cable is typically asymmetric, meaning download speeds (up to 1.2 Gbps) are faster than upload speeds.
*   **Digital Subscriber Line (DSL):** Piggybacks on existing copper telephone lines. It separates voice and data into different frequencies, also offering asymmetric speeds.
*   **Home & Enterprise Networks:** A typical home network uses a combination of a modem, a router/firewall, and a WiFi access point. Enterprise networks scale this up, using a mix of high-speed wired Ethernet (up to 10 Gbps) and wireless links to connect servers and users across entire campuses.

### The Physical Media
Data needs a physical medium to travel across.
*   **Guided Media:** Signals travel through a solid medium. Examples include **Twisted Pair (TP)** copper wires (used in Ethernet), **Coaxial Cables**, and **Fiber Optic Cables** (which use pulses of light for ultra-fast, long-distance transmission immune to electromagnetic noise).
*   **Unguided Media:** Signals broadcast freely, like **Wireless Radio**. This includes WiFi (Local Area Networks), 4G/5G cellular (Wide Area Networks), Bluetooth, and Satellite links. These signals are susceptible to environmental factors like reflection and physical obstructions.

### The Network Core
If the edge is the neighborhoods and driveways, the core is the global highway system. The network core is a mesh of interconnected routers. Its two main jobs are:
1.  **Routing (Global):** Using algorithms to determine the entire path a packet should take from source to destination.
2.  **Forwarding or Switching (Local):** The localized action where a router looks at an arriving packet's destination address, consults its internal forwarding table, and moves the packet to the correct output link.

---

## 4. Circuit Switching vs. Packet Switching

How do we share the massive resources of the network among billions of users? Historically, there were two main approaches. 

### Circuit Switching (The Old Way)
Think of making a reservation at a restaurant. In circuit switching, end-hosts explicitly request and reserve a dedicated path (a circuit) through the network before they send any data.
*   **How it works:** Resources are reserved at call setup and released at teardown. Data flows along this single, guaranteed path.
*   **Multiplexing:** It shares links using techniques like **Time-Division Multiplexing (TDM)** (dividing time into slots) or **Frequency-Division Multiplexing (FDM)** (dividing frequencies into bands).
*   **The Flaw:** It uses *static allocation*. If your application isn't actively sending data, that reserved capacity sits completely idle and is wasted.

### Packet Switching (The Internet Way)
Think of a first-come, first-serve diner. In packet switching, data is broken into smaller chunks called **packets**, each containing a header with source and destination addresses. 
*   **Store-and-Forward:** A router must receive the *entire* packet before it can begin forwarding it to the next link.
*   **Statistical Multiplexing:** Resources are allocated on demand. Hosts just send packets and "hope for the best." Because it is highly unlikely that every user will need maximum bandwidth at the exact same millisecond, the network can support far more users efficiently.
*   **Example:** Imagine a 1 Gbps link where users need 100 Mbps, but only 10% of the time. Circuit switching could only support exactly 10 users (10 * 100 Mbps = 1 Gbps). Packet switching, utilizing the laws of binomial probability, can support 35 users with a less than 0.04% chance of the network being overwhelmed!

---

## 5. Performance: Delay, Loss, and Throughput

Because packet switching does not reserve resources, traffic jams can happen. When packets arrive at a router faster than the router can send them out, they wait in a **queue** (buffer). If the queue fills up completely, new arriving packets are dropped. This is **packet loss**.

The total delay a packet experiences at a single router node ($d_{nodal}$) is the sum of four parts:

$$d_{nodal} = d_{proc} + d_{queue} + d_{trans} + d_{prop}$$

1.  **Nodal Processing ($d_{proc}$):** The time a router takes to check for bit errors and determine the output link (usually microseconds).
2.  **Queueing Delay ($d_{queue}$):** The time spent waiting in the buffer. This depends heavily on network congestion. We measure this using **Traffic Intensity** ($La/R$, where $L$ is packet length, $a$ is arrival rate, and $R$ is bandwidth). As traffic intensity approaches 1, queueing delays spike exponentially. If it exceeds 1, the delay theoretically approaches infinity, and packets are lost.
3.  **Transmission Delay ($d_{trans}$):** The time required to physically push all the packet's bits onto the wire. Formula: $d_{trans} = L/R$.
4.  **Propagation Delay ($d_{prop}$):** The time it takes for a bit to travel through the physical medium to the next router. Formula: $d_{prop} = d/s$ (distance divided by the speed of light in that medium).

> **The Toll Booth Analogy:** Imagine a 10-car caravan (a 10-bit packet) traveling down a highway between toll booths (routers). 
> *   **Transmission delay** is the time it takes the toll booth worker to process all 10 cars and push them onto the highway.
> *   **Propagation delay** is the time it takes the cars to physically drive to the next toll booth.

*Note: You can actually measure real-world internet delays yourself using a command-line tool called `traceroute`, which bounces test packets off routers along a path to measure round-trip times.*

---

## 6. Open Architecture & The TCP/IP Protocol Suite

The modern Internet is built on the concept of **Open Architecture Networking**. No single entity dictates internal network designs; distinct networks can be built however their creators want, as long as they connect via "black-box" gateways (routers) using a meta-level internetworking architecture.

This led to the creation of the **TCP/IP** suite, breaking networking into two main protocols:
*   **IP (Internet Protocol):** Handles the addressing and best-effort forwarding of individual packets.
*   **TCP (Transmission Control Protocol):** Sits on top of IP to provide reliable delivery, flow control, and recovery from the packet loss inherent in packet switching.
*   **UDP (User Datagram Protocol):** A lightweight, "unreliable" alternative to TCP for applications that prioritize speed over perfect accuracy (like live video or gaming).

---

## 7. The Magic of Layers (The Protocol Stack)

Networks are incredibly complex. To make them manageable, engineers use **layers of abstraction**. Each layer relies on the services of the layer below it and provides services to the layer above it. 

### The 5-Layer Internet Model
1.  **Application Layer:** Where your apps live (HTTP for web, SMTP for email, DNS). Data here is called a **message**.
2.  **Transport Layer:** Manages process-to-process delivery (TCP, UDP). It wraps the message in a Transport header to create a **segment**.
3.  **Network Layer:** Handles routing from source to destination (IP). It wraps the segment in a Network header to create a **datagram**.
4.  **Link Layer:** Handles data transfer between neighboring devices (Ethernet, WiFi). It wraps the datagram in a Link header to create a **frame**.
5.  **Physical Layer:** Physically moves the raw bits over wires, fibers, or airwaves.

### Encapsulation: The Matryoshka Dolls of Data
When you send an email, your computer doesn't just shoot raw text into the wall. As the message moves *down* the layers on your machine, each protocol adds its own **header** (metadata containing instructions), enveloping the data like a set of Russian nesting dolls. This is called **encapsulation**. 

When the packet arrives at the destination, it moves *up* the layers. Each layer reads its specific header, strips it off (**decapsulation**), and passes the payload up to the next layer. 

> **The Postal Analogy:** 
> *   **Application (CEO):** Alice writes a letter to Bob.
> *   **Transport (Secretary):** The secretary puts it in an envelope, addressing it "From Alice, To Bob."
> *   **Network (Mailroom):** The mailroom puts that envelope into a larger box addressed "From 123 Alice St. to 456 Bob St."
> *   **Link/Physical (Mail Carrier):** The mail carrier physically drives the box to the post office. 

**Crucially, intermediate routers only implement the bottom three layers (Physical, Link, and Network).** They open the "box" just enough to read the IP address, decide where to forward it, put it in a new Link-layer box, and send it on its way. They never look at the Application data inside.

### The "Narrow Waist"
If you look at all the protocols, there are dozens of Application protocols (HTTP, FTP), Transport protocols (TCP, UDP), and Link protocols (WiFi, Ethernet). But there is only **one** Network layer protocol: **IP**. Because every device and router on the Internet speaks IP, it acts as a universal translator, unifying vastly different physical networks into the single, cohesive Internet we use today.

---

## 8. A Quick Word on Security

The Internet was originally designed with a vision of "mutually trusting users." Security was not built-in from day one. Today, protocol designers play catch-up against bad actors.

Common threats include:
*   **Packet Sniffing:** Attackers silently reading broadcast data on shared networks (like public WiFi).
*   **IP Spoofing:** Attackers injecting packets with a fake source address to impersonate someone else.
*   **Denial of Service (DoS):** Attackers using compromised computers (botnets) to overwhelm a server with bogus traffic, taking it offline.

To fight back, modern networks rely on multiple lines of defense, including **authentication** (proving who you are), **confidentiality** (encryption), **integrity checks** (digital signatures), and **firewalls** (middleboxes that filter out malicious traffic).