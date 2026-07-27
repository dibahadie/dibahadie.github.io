---
layout: notebook
is_cover: false
notebook_id: "computer-eng"
notebook_title: "Computer Engineering Topics"
title: "Data Plane"
order: 4
custom_css: notebook_layout
category: "Computer Engineering"
---

In this post, we will unpack the fundamental concepts that govern how data navigates the internet.

---

## 1. Network Layer Overview: Forwarding vs. Routing

To understand the network layer, we first need to distinguish between its two primary functions: forwarding and routing.

*   **Forwarding (Data Plane):** This is the process of moving packets from a router's input link to the appropriate output link. Think of this as the local, per-router action of getting a car through a single highway interchange.
*   **Routing (Control Plane):** This is the network-wide logic that determines the specific end-to-end route taken by packets from the source to their destination. This is analogous to planning the entire trip from start to finish.

### Control Plane Approaches
The control plane can be implemented in two distinct ways:
1.  **Traditional Routing Algorithms:** The routing algorithm components are implemented individually inside each and every router.
2.  **Software-Defined Networking (SDN):** A remote controller server computes and installs the forwarding tables into the routers.

### Network Service Models
When transporting datagrams, what kind of guarantees does the network provide? The Internet operates on a **"best-effort"** service model.

*   **Internet Best-Effort:** Provides absolutely no guarantees regarding successful datagram delivery, bandwidth, timing, or packet ordering. Despite these missing guarantees, the simplicity of this mechanism has allowed the Internet to be widely deployed. Furthermore, sufficient provisioning of bandwidth allows the performance of real-time applications to be "good enough" most of the time.
*   **Alternative Models:** Network architectures like ATM (Asynchronous Transfer Mode) offer models like Constant Bit Rate or Available Bit Rate, which can guarantee minimum bandwidths and timing. Intserv and Diffserv are other architectures that attempt to add Quality of Service (QoS) guarantees.

---

## 2. What's Inside a Router?

Routers are specialized devices divided into hardware and software components. The routing and management control plane operates in software (in the millisecond timeframe), while the forwarding data plane relies on hardware (in the nanosecond timeframe).

### Input Ports
Input ports handle bit-level reception and link-layer protocol processing (like Ethernet) before moving to lookup and forwarding.
*   **Decentralized Switching:** The input port uses header field values to look up the correct output port using a local forwarding table.
*   **Longest Prefix Matching:** When finding a table entry for a destination address, the router uses the longest address prefix that matches the destination. This is often performed at lightning speed using Ternary Content Addressable Memories (TCAMs), which retrieve addresses in a single clock cycle.
*   **Queuing:** If datagrams arrive faster than the switching fabric can process them, input port queuing occurs. This can lead to **Head-of-the-Line (HOL) blocking**, where a delayed datagram at the front of the queue prevents other datagrams behind it from moving forward.

### Switching Fabrics
The switching fabric transfers packets from the input links to the appropriate output links. The switching rate is ideally N times the line rate (where N is the number of inputs). There are three major types of switching fabrics:
1.  **Memory:** Early routers copied packets into system memory under direct CPU control. Speed is limited by memory bandwidth.
2.  **Bus:** Datagrams travel over a shared bus. Speed is limited by bus contention (e.g., a 32 Gbps bus is sufficient for access routers).
3.  **Interconnection Network:** Advanced fabrics, like crossbars, overcome bus bandwidth limitations by allowing multiple parallel connections.

### Output Ports & Buffer Management
Queuing also happens at output ports when the arrival rate from the switch exceeds the output line speed. This requires careful buffer management:
*   **Drop Policies:** If buffers are full, the router must decide which packets to drop (e.g., tail drop removes the arriving packet, or priority drop removes based on classification).
*   **How Much Buffering is Needed?** An old RFC 3439 rule of thumb suggests buffering equal to a typical Round Trip Time (RTT) multiplied by the link capacity (C). For a system with N flows, a more recent recommendation is calculated via the formula:
    $$ \frac{\text{RTT} \cdot C}{\sqrt{N}} $$
    Too much buffering, however, can increase delays—a common issue in home routers.

### Packet Scheduling
Routers must decide which queued packet to send next over the link.
*   **FCFS (First-Come, First-Served):** Packets are transmitted strictly in their order of arrival.
*   **Priority:** Traffic is classified into queues, and packets are always sent from the highest-priority queue that contains data.
*   **Round Robin (RR):** The server repeatedly cycles through class queues, sending one complete packet from each class in turn.
*   **Weighted Fair Queuing (WFQ):** A generalized version of Round Robin. Each class i is assigned a weight, W_i, and is guaranteed a minimum bandwidth based on the fraction:
    $$ \frac{W_i}{\sum W_j} $$

---

## 3. The Internet Protocol (IP)

### IP Datagram Format
An IPv4 datagram contains several vital fields:
*   **Version Number:** Indicates the IP protocol version.
*   **Time To Live (TTL):** Tracks the remaining maximum hops the packet can take, decremented at each router.
*   **Overhead:** A typical datagram carries 40 bytes of overhead (20 bytes for the IP header and 20 bytes for the TCP header) before application data is even included.
*   **Length:** The maximum length is 64K bytes, but they are typically 1500 bytes or less.
*   **Addresses:** 32-bit source and destination IP addresses.

### Fragmentation & Reassembly
Different network links have different Maximum Transmission Units (MTUs)—the largest possible link-level frame they can carry. If an IP datagram is larger than a link's MTU, it must be fragmented into smaller datagrams within the network.
*   These fragments are only reassembled once they reach their final destination.
*   Routers use the IP header bits (ID, flag, offset) to identify and order related fragments.
*   *Example:* A 4000-byte datagram traversing a link with a 1500-byte MTU will be fragmented into three smaller datagrams (e.g., lengths of 1500, 1500, and 1040 bytes).

---

## 4. IP Addressing and Subnets

An IP address is a 32-bit identifier associated with a host or router interface (the connection between the device and the physical link). They are usually expressed in dotted-decimal notation (e.g., 223.1.1.1).

### Subnets and CIDR
A subnet consists of device interfaces that can physically reach each other without passing through an intervening router. IP addresses contain structure:
*   **Subnet Part:** High-order bits common to all devices in the same subnet.
*   **Host Part:** Remaining low-order bits.

The Internet uses **CIDR (Classless InterDomain Routing)** to format addresses. Addresses are written as `a.b.c.d/x`, where `x` is the number of bits defining the subnet portion (the subnet mask).

### How Hosts Get IP Addresses: DHCP
Hosts dynamically obtain IP addresses via the **Dynamic Host Configuration Protocol (DHCP)**. DHCP allows a host to "plug-and-play" and renew leases on addresses, natively supporting mobile users. The sequence works like this:
1.  **DHCP Discover:** The arriving client broadcasts to ask if a DHCP server is out there.
2.  **DHCP Offer:** The server broadcasts an offer with an available IP address.
3.  **DHCP Request:** The client broadcasts its intent to use the offered IP address.
4.  **DHCP ACK:** The server broadcasts a confirmation that the client owns the address.

Beyond an IP address, DHCP also provides the address of the first-hop router, the name and IP of the DNS server, and the network subnet mask.

### Route Aggregation
ISPs receive blocks of IP addresses from ICANN (Internet Corporation for Assigned Names and Numbers). ISPs use hierarchical addressing to allocate smaller blocks to individual organizations. This structure allows for efficient route aggregation, where an ISP can advertise a single, unified route for multiple subnet blocks to the broader Internet.

---

## 5. Network Address Translation (NAT)

By 2011, ICANN had allocated the final chunk of IPv4 addresses. To combat this exhaustion, **NAT (Network Address Translation)** was introduced.

NAT allows all devices in a local network (using private IP prefixes like 10/8, 172.16/12, or 192.168/16) to share a single public IPv4 address assigned by an ISP.

*   **How it works:** A NAT router transparently replaces the source IP address and port number of outgoing datagrams with the shared NAT IP address and a new port. It records this swap in a NAT translation table. When a reply arrives, the router checks the table and replaces the destination NAT IP and port with the original local IP and port.
*   **The Controversy:** NAT violates the end-to-end argument because a network-layer device is manipulating port numbers (a transport-layer concept). Furthermore, routers are technically only supposed to process data up to layer 3. Despite these complaints, NAT is massively deployed in home networks, institutions, and 4G/5G cellular networks.

---

## 6. IPv6: The Future of the Internet

Because the 32-bit IPv4 address space simply ran out of room, IPv6 was created.

### IPv6 Datagram Format
IPv6 expands the address space significantly to **128 bits**. The protocol also introduces a streamlined, 40-byte fixed-length header to speed up processing and forwarding.
*   **What's Missing?** Compared to IPv4, IPv6 removes the checksum entirely to speed up processing at routers. It also completely removes fragmentation and reassembly capabilities from network routers.

### The Transition to IPv6
Because we cannot upgrade all routers worldwide at the same time (no "flag days"), the network relies heavily on **Tunneling**. During transit between IPv4-only routers, the entire IPv6 datagram is stuffed directly into the payload of an IPv4 datagram—a literal "packet within a packet".

Deployment has been a slow process, taking well over 25 years. However, adoption is steadily rising; as of 2023, Google reported that roughly 40% of clients access their services via IPv6, and one-third of US government domains are IPv6 capable.