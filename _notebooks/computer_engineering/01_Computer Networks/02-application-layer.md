---
layout: notebook
is_cover: false
notebook_id: "computer-eng"
notebook_title: "Computer Engineering Topics"
title: "Application Layer"
order: 2
custom_css: notebook_layout
category: "Computer Engineering"
---

# The Application Layer: DNS, Video Streaming, and the Transport Interface

The Application Layer is the topmost layer of the network stack, where network applications and protocols like HTTP, SMTP, and DNS reside. In this post, we will conclude our deep dive into the Application layer by exploring DNS, Peer-to-Peer file distribution, and video streaming, before transitioning into the foundational concepts of the Transport Layer.

---

## 1. What is DNS For?

Humans and computers prefer different ways of identifying things on the Internet.
*   **Human Preference:** People use identifiers like names, social security numbers, or passport numbers. For websites, humans prefer domain names (like `www.google.com` or `cs.umass.edu`) because they consist of meaningful words and are easy to remember. However, these names contain no relevant routing information and are not useful for machines.
*   **Machine Preference:** Internet hosts and routers use 32-bit IP addresses (like `74.125.25.99`) for addressing datagrams, which helps make routing scalable. 

To bridge this gap, we use the **Domain Name System (DNS)**. DNS is an Internet protocol that translates human-readable domain names into IP addresses, and vice versa. While it acts as a core Internet function, it is implemented as an application-layer protocol, which keeps the complexity at the "edge" of the network.

### Key Services Provided by DNS
Aside from hostname-to-IP-address translation, DNS offers several other services:
*   **Host Aliasing:** Maps alias names to canonical names.
*   **Mail Server Aliasing:** Directs emails to the correct mail servers.
*   **Load Distribution:** Maps a single domain name to many IP addresses, which distributes traffic across replicated Web servers.

## 2. DNS Design: A Distributed Hierarchy

You might wonder why we don't just put all domain names into one centralized database. A centralized design simply doesn't scale. It would create a single point of failure, require maintenance of a distant centralized database, and fail under the massive traffic volume. To put this in perspective, Comcast's DNS servers handle 600 billion queries a day, and Akamai handles 2.2 trillion queries a day!

Instead, DNS is designed as a humongous distributed database featuring about a billion simple records. It is organizationally and physically decentralized, with millions of different organizations responsible for their own records.

### The Three Levels of the DNS Hierarchy
The DNS tree represents three forms of hierarchy: names, authority, and infrastructure.
*   **Root DNS Servers:** These sit at the very top of the hierarchy and are controlled by ICANN (Internet Corporation for Assigned Names and Numbers). DNS queries always start with a request to the root name server.
*   **Top-Level Domain (TLD) Servers:** These are directly below the root. Historically, there were relatively few TLDs based on purpose (like `.com`, `.org`, `.edu`) or country (like `.uk`, `.fr`, `.jp`). Today, there are over 1500 TLDs, including newer ones like `.travel` or `.pizza`. Specific registries manage these: for example, Network Solutions is the authoritative registry for `.com` and `.net`, while Educause manages `.edu`.
*   **Authoritative DNS Servers:** These are maintained by organizations (or their service providers) to provide the authoritative hostname to IP mappings for that organization's hosts. Organizations can also delegate parts of their zone to others; for example, UC Berkeley owns the `berkeley.edu` zone but gives the `eecs.berkeley.edu` zone to the EECS department.

## 3. How a DNS Lookup Works

When you want to visit a website, your computer needs to figure out who to ask.

### Resolvers
*   **Stub Resolver:** This is the resolver on your local computer. It only contacts the recursive resolver and receives the final answer.
*   **Recursive Resolver:** This is the resolver that makes the actual DNS queries across the Internet. They are usually run by ISPs or application providers (like Cloudflare's `1.1.1.1` or Google's `8.8.8.8`). Recursive resolvers build a large cache from multiple users' requests, which heavily reduces the load on authoritative name servers.

### Iterated vs. Recursive Queries
There are two ways name servers can handle requests:
*   **Iterated Query:** The contacted server replies with the name of the next server to contact (e.g., "I don't know this name, but ask this server").
*   **Recursive Query:** The contacted server takes on the burden of resolving the name itself. This places a heavy load on the upper levels of the hierarchy, so iterated queries are more common between infrastructure servers.

## 4. DNS Implementation Details

From a developer's perspective, DNS uses relatively simple APIs available in almost all programming languages. An older example in C is `gethostbyname` (which is limited to IPv4 and is deprecated), while the modern replacement is `getaddrinfo` (which supports IPv6). These functions hide the complexity of DNS from the developer and simply make requests to the OS's configured resolving DNS server.

### UDP vs. TCP
DNS needs to be lightweight and fast, as almost every Internet connection starts with a name lookup. If DNS is slow, every connection is slow.
*   DNS primarily uses **UDP** (User Datagram Protocol) because it requires no 3-way handshake and no connection state maintenance.
*   Queries are typically sent to a well-known UDP destination port: **53**.
*   If a UDP packet is dropped, the system sets a timer and retries on timeout.
*   Larger messages that don't fit in a UDP packet can be sent over **TCP**.
*   Recent advances in DNS use secure transport protocols with encryption because standard TCP and UDP are vulnerable to attackers.

### The DNS Packet Format
A DNS packet consists of a header and a payload.
*   **DNS Header:** Contains a 16-bit ID number chosen by the client (used to associate queries with responses), flags (like the QR bit which is 0 in queries and 1 in responses, and the RD bit for requesting recursion), and counts indicating the number of records in the payload sections.
*   **DNS Payload:** Contains a variable number of Resource Records (RRs) sorted into four sections: Question, Answer, Authority, and Additional (sometimes called glue records). 

### DNS Record Types
Each Resource Record (RR) is a name-value pair with a specific type and a Time To Live (TTL) that dictates how long it can be cached. Important types include:
*   **A:** Maps a domain name to an IPv4 address.
*   **AAAA:** Maps a domain name to an IPv6 address.
*   **NS:** Designates another DNS server (Name Server) to handle a domain.
*   **CNAME:** Indicates that a domain is an alias for a true, canonical name.
*   **MX:** Maps a domain to a mail server, with a priority value attached (lowest number is tried first).

## 5. Scaling, Availability, and Other Uses

Given that DNS handles trillions of queries daily, performance and "bulletproof" reliability are paramount. 

### Caching
Answers are cached by recursive resolvers and local machines using the TTL field provided in the DNS records. If a resolver already knows the answer from a previous query, it will satisfy the request directly from its cache.

### Zone Redundancy
Zones "must" have at least two authoritative name servers for redundancy to ensure availability. This operates on a primary/secondary model. The primary name server manages and updates the actual records, while the secondary uses a read-only copy and receives periodic transfers from the primary server.

### Anycast for Root Servers
If the root servers were to fail, anyone with an empty cache would be unable to make any lookups. To prevent this, root servers utilize a trick called **anycast**. While there are technically only 13 root-server domains (named `a.root-servers.net` through `m.root-servers.net`), there are actually thousands of physical servers across the globe. Anycast allows thousands of servers to use the exact same IP address. Routing protocols automatically direct your query to the closest available physical server sharing that IP address.

### DNS for Load Balancing
DNS can distribute load across replicated servers. For popular services like YouTube or Twitter, a name server can return multiple IP addresses for a single domain name. The server shuffles the order of these A records in its response, providing coarse-grained load balancing and simple resiliency. Furthermore, some servers use geographical load-balancing logic—using the client's or recursive resolver's IP address—to attempt to direct the client to the "nearest" or best-performing server.

### DNS Security
DNS is vulnerable to several types of attacks:
*   **DDoS Attacks:** Attackers can attempt to bombard root or TLD servers with traffic. While largely unsuccessful against root servers due to traffic filtering and caching, attacks on TLD servers can be more dangerous.
*   **Spoofing Attacks:** Attackers can intercept DNS queries and return bogus replies, leading to DNS cache poisoning.
*   **Defense:** DNSSEC (RFC 4033) provides authentication services to combat these vulnerabilities.

---

## 6. Peer-to-Peer (P2P) Architecture & File Distribution

Unlike Client-Server architectures, a **Peer-to-Peer (P2P)** architecture has no "always-on" server. Instead, arbitrary end systems (peers) directly communicate with one another. Peers request service from other peers, and provide service in return. Examples include P2P file sharing (BitTorrent), streaming (Kankan), and VoIP (Skype).

This creates **self-scalability**: as new peers join, they bring new service demands, but they *also* bring new service capacity (upload bandwidth). However, because peers are intermittently connected and often change IP addresses, P2P networks require complex management.

### File Distribution Time: Client-Server vs. P2P

Consider distributing a file of size $F$ to $N$ peers. 
Let $u_s$ be the server's upload capacity, $d_i$ be peer $i$'s download capacity, and $u_i$ be peer $i$'s upload capacity.

**Client-Server Approach:**
*   **Server transmission:** The server must sequentially send $N$ copies of the file. The time to send one copy is $F/u_s$, so the time to send $N$ copies is $NF/u_s$.
*   **Client download:** Each client must download a copy. The minimum download time for the slowest client is $F/d_{min}$.
*   **Total Time:** The time to distribute the file to $N$ clients ($D_{c-s}$) is greater than or equal to $max\{NF/u_s, F/d_{min}\}$. Note that as $N$ grows, the distribution time increases linearly because $NF/u_s$ scales with $N$.

**P2P Approach:**
*   **Server transmission:** The server only needs to upload *at least one* copy to the network, which takes $F/u_s$.
*   **Client download:** The minimum client download time remains $F/d_{min}$.
*   **Aggregate Capacity:** All clients must collectively download $NF$ bits. However, the maximum upload rate of the entire system is now the server's upload rate *plus* the sum of all peer upload rates: $u_s + \Sigma u_i$.
*   **Total Time:** The time to distribute the file ($D_{P2P}$) is greater than or equal to $max\{F/u_s, F/d_{min}, NF/(u_s + \Sigma u_i)\}$. 

While the required data ($NF$) increases linearly with $N$, the *capacity* to deliver that data ($u_s + \Sigma u_i$) also increases as each new peer brings their own upload capacity to the swarm. As a result, P2P distribution times grow much slower than Client-Server times as the number of peers increases.

### BitTorrent Example
In BitTorrent, a file is divided into chunks (e.g., 256Kb). A **torrent** is a group of peers exchanging these chunks. When Alice joins a torrent, she registers with a **tracker** to get a list of peers and connects to a subset of them ("neighbors"). 
*   **Requesting:** Alice periodically asks her peers for a list of their chunks and requests the ones she is missing, prioritizing the "rarest first".
*   **Sending (Tit-for-Tat):** Alice sends chunks to the four peers currently sending her chunks at the highest rate, while "choking" (ignoring) the others. She re-evaluates this top four every 10 seconds. Every 30 seconds, she "optimistically unchokes" a random peer, allowing them to potentially join the top four.

---

## 7. Video Streaming and CDNs

Stream video traffic is a major consumer of Internet bandwidth. As an example, Netflix, YouTube, and Amazon Prime accounted for 80% of residential ISP traffic in 2020. The primary challenges in video streaming are scaling the infrastructure to reach roughly a billion users and managing heterogeneity. Heterogeneity refers to the fact that different users have different capabilities, such as using wired versus mobile connections, or existing in bandwidth-rich versus bandwidth-poor environments. The core solution to these challenges relies on a distributed, application-level infrastructure.

### Video Encoding
Video is fundamentally a sequence of images displayed at a constant rate, such as 24 images per second. A digital image is an array of pixels, where each pixel is represented by bits. To decrease the number of bits needed to encode an image, video coding exploits redundancy within and between images:
*   **Spatial Coding:** Leverages redundancy within an image. Instead of sending $N$ identical color values for a single frame, the system can send only two values: the color value and the number of repeated values.
*   **Temporal Coding:** Leverages redundancy from one image to the next. Instead of sending a complete frame, it only sends the differences from the previous frame.
*   **Bit Rates:** Video can be encoded at a Constant Bit Rate (CBR), where the video encoding rate is fixed, or a Variable Bit Rate (VBR), where the encoding rate changes as the amount of spatial and temporal coding changes. Common examples include MPEG 1 (used for CD-ROM) at 1.5 Mbps, MPEG 2 (used for DVD) at 3-6 Mbps, and MPEG 4 (often used on the Internet) ranging from 64 Kbps to 12 Mbps. 

### Streaming Stored Video
In a simple scenario, a video server sends stored video to a client over the Internet. The server-to-client bandwidth will vary over time as network congestion levels change in the house, access network, network core, or video server. Packet loss and delay due to congestion will either delay playout or result in poor video quality. 
*   **Continuous Playout Constraint:** During client video playout, the playout timing must match the original timing. During streaming, the client actively plays out an early part of the video while the server is still sending a later part of the video.
*   **Playout Buffering:** Because network delays are variable (causing delay jitter), the system relies on a client-side buffer to compensate and match the continuous playout constraint.
*   **Other Challenges:** Video systems must also handle client interactivity (e.g., pause, fast-forward, rewind, jump through video) and deal with video packets that may be lost and retransmitted.

### DASH: Dynamic, Adaptive Streaming over HTTP
Streaming video practically equates to the combination of encoding, DASH, and playout buffering. To handle varying bandwidths and heterogeneous clients, modern streaming utilizes DASH.
*   **Server-side:** The server divides the video file into multiple chunks. Each chunk is encoded at multiple different rates, and these different rate encodings are stored in different files. These files are then replicated across various CDN nodes. A **manifest file** provides the URLs for these different chunks.
*   **Client-side ("Intelligence"):** The intelligence in DASH lives at the client, which periodically estimates the server-to-client bandwidth. Consulting the manifest, the client requests one chunk at a time. It chooses the maximum coding rate sustainable given the current bandwidth. The client determines *when* to request a chunk (so that buffer starvation or overflow does not occur), *what* encoding rate to request (seeking higher quality when more bandwidth is available), and *where* to request the chunk (choosing a URL server that is "close" to the client or has high available bandwidth). The client can choose different coding rates at different points in time from different servers.

### Content Distribution Networks (CDNs)
The monumental challenge is how to stream content—selected from millions of videos—to hundreds of thousands of simultaneous users. Relying on a single, large "mega-server" does not scale because it creates a single point of failure, acts as a point of network congestion, and establishes a long (and possibly congested) path to distant clients. Instead, Content Distribution Networks (CDNs) store and serve multiple copies of videos at multiple geographically distributed sites.
*   **Enter Deep:** Some CDNs push their servers deep into many access networks to get extremely close to users. Akamai, for example, had 240,000 servers deployed in over 120 countries in 2015. Today, the Akamai Edge boasts 360,000 servers, processing 100+ million hits per second, and 7+ trillion deliveries per day. It delivers 175+ terabits per second (with over 250 Tbps at peak) and spans 4,200+ locations, 1,350+ networks, 840+ cities, and 135 countries.
*   **Bring Home:** Other CDNs build a smaller number (tens) of larger clusters situated in Points of Presence (POPs) near access networks, an approach used by companies like Limelight.
*   **DNS Redirects to CDNs:** When a user requests content, the Domain Name System is typically involved to redirect the request to a CDN server. For instance, if a user visits NetCinema and clicks a video link, their host sends a DNS query for `video.netcinema.com`. The user's Local DNS Server (LDNS) relays the query to an authoritative DNS server for NetCinema. To "hand over" the query, the NetCinema authoritative server returns a hostname in the CDN's domain (e.g., `a1105.kingcdn.com`) to the LDNS. The LDNS then sends a second query for this new address into KingCDN's private DNS infrastructure, which eventually returns the IP address of a KingCDN content server. The LDNS forwards this IP address to the user's host, which establishes a direct TCP connection with the CDN server to issue an HTTP GET request or retrieve a DASH manifest file.
*   **Over the Top (OTT):** Companies like Netflix utilize "over the top" services, storing copies of content at their worldwide OpenConnect CDN nodes. A subscriber requests content, the service provider returns a manifest, and the client retrieves the content at the highest supportable rate. The client may choose a different rate or copy if the network path is congested. OTT treats Internet host-host communication as a service. OTT providers face the challenge of coping with a congested Internet right from the "edge", meaning they must meticulously determine what content to place in which CDN node, and clients must decide from which CDN node to retrieve content at which rate.

---

## 8. Introduction to the Transport Layer

As we move down the protocol stack, we encounter the **Transport Layer**. The transport layer provides logical communication between application *processes* running on different hosts. This relies on and enhances the network layer services, which provide logical communication between the *hosts* themselves.

*   **Sender Actions:** The sender is passed an application-layer message, determines the segment header fields values, creates the segment, and passes the segment to the IP network layer.
*   **Receiver Actions:** The receiver receives a segment from the IP layer, checks the header values, extracts the application-layer message, and demultiplexes the message up to the application via a socket.

> **The Household Analogy:** Imagine 12 kids in Ann's house sending letters to 12 kids in Bill's house.
> *   **Hosts:** The houses themselves.
> *   **Processes:** The individual kids.
> *   **Application Messages:** The letters inside the envelopes.
> *   **Network Layer:** The postal service moving mail between the houses.
> *   **Transport Layer:** Ann and Bill, who collect the letters and distribute the received mail to the right siblings.

### The Two Principal Internet Transport Protocols
There are two transport protocols available to Internet applications:
*   **TCP (Transmission Control Protocol):** A connection-oriented transport protocol that provides reliable, in-order delivery. It features congestion control to throttle the sender when the network is overloaded, flow control to ensure the sender won't overwhelm the receiver, and strict connection setup requirements between client and server processes.
*   **UDP (User Datagram Protocol):** A connectionless transport protocol offering unreliable, unordered delivery. It serves as a no-frills extension of "best-effort" IP and does not provide reliability, flow control, congestion control, connection setup, timing, or security.
*   **Services Not Available:** At the transport layer, neither TCP nor UDP can provide delay guarantees or bandwidth guarantees.

### Multiplexing and Demultiplexing
Multiplexing and demultiplexing happen at all layers of the network stack, but at the transport layer, they are fundamentally based on segment and datagram header field values. Because a single host can run many applications, the Transport layer must know how to route arriving data to the correct process. 
*   **Multiplexing (Sender):** The sender handles data from multiple sockets and adds a transport header that will be later used for demultiplexing.
*   **Demultiplexing (Receiver):** The receiver uses the header info to deliver received segments to the correct socket. A host receives IP datagrams that each carry a source IP address, a destination IP address, and a single transport-layer segment containing a source port number and a destination port number. The host uses these IP addresses and port numbers to direct the segment to the appropriate socket.
*   **TCP/UDP Segment Format:** Both TCP and UDP utilize a segment format featuring a 32-bit width layout that holds the source port number, the destination port number, other specific header fields, and the application data (payload).

### Connectionless vs. Connection-Oriented Demultiplexing
The Transport Layer handles demultiplexing differently depending on whether it is using UDP or TCP:
*   **Connectionless Demultiplexing (UDP):** When creating a UDP socket, the application must specify a host-local port number. When creating a datagram to send into a UDP socket, the destination IP address and destination port number must be explicitly specified. When the receiving host receives the UDP segment, it strictly checks the destination port number and directs the segment to the socket bound to that port. If IP/UDP datagrams have the same destination port number, but different source IP addresses or source port numbers, they will still be directed to the exact same socket at the receiving host.
*   **Connection-Oriented Demultiplexing (TCP):** A TCP socket is specifically identified by a **4-tuple**: source IP address, source port number, destination IP address, and destination port number. The receiver demultiplexes by using all four values to direct the segment to the appropriate socket. Because of this, a server can seamlessly support many simultaneous TCP sockets, where each socket is identified by its own 4-tuple and is associated with a different connecting client.