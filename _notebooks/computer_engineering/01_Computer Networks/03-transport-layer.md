---
layout: notebook
is_cover: false
notebook_id: "computer-eng"
notebook_title: "Computer Engineering Topics"
title: "Transport Layer: Comprehensive Guide"
order: 3
custom_css: notebook_layout
category: "Computer Engineering"
---

# The Transport Layer

While the Network Layer (IP) provides logical communication between *hosts*, the Transport Layer provides logical communication between *application processes* running on those different hosts. 

## 1. Overview of the Transport Layer
The transport layer takes application messages, breaks them into segments (adding a transport header), and passes them to the network layer. On the receiving end, it reassembles those segments back into messages and passes them up to the correct application.

> **The Household Analogy:** Imagine 12 kids in Ann's house sending letters to 12 kids in Bill's house.
> *   **Hosts:** The houses themselves.
> *   **Processes:** The individual kids.
> *   **Application Messages:** The letters inside the envelopes.
> *   **Network Layer:** The postal service moving mail between the houses.
> *   **Transport Layer:** Ann and Bill, who collect the letters from their siblings and hand them to the mail carrier, and later distribute the received mail to the right siblings.

The Internet provides two principal transport protocols:
*   **UDP (User Datagram Protocol):** A connectionless, unreliable, unordered delivery service (a "no-frills" extension of best-effort IP).
*   **TCP (Transmission Control Protocol):** A connection-oriented service that provides reliable, in-order delivery, flow control, and congestion control. 
*   *Note: Neither protocol guarantees delay or bandwidth.*

---

## 2. Multiplexing and Demultiplexing
Because a single host can run many network applications simultaneously, the transport layer must know how to route data to the correct process. 
*   **Multiplexing (Sender):** The transport layer gathers data from multiple application sockets, adds a transport header (containing source and destination port numbers), and passes the segment to the network layer.
*   **Demultiplexing (Receiver):** The transport layer examines the header fields of an incoming segment and uses those port numbers (and sometimes IP addresses) to direct the segment to the correct application socket.

### Connectionless vs. Connection-Oriented Demultiplexing
*   **UDP (Connectionless):** Demultiplexes using *only* the destination port number. If two different clients send UDP packets to the same destination port on a server, both packets go to the exact same socket.
*   **TCP (Connection-Oriented):** Demultiplexes using a **4-tuple**: Source IP, Source Port, Destination IP, and Destination Port. This allows a web server to maintain multiple simultaneous TCP sockets, each exclusively communicating with a specific connecting client.

---

## 3. UDP: The "No-Frills" Protocol
UDP provides a "best effort" service; its segments may be lost or delivered out of order. It is connectionless, meaning there is no handshaking, and each segment is handled independently.

**Why does UDP exist?**
1.  **No connection establishment:** Avoids the round-trip time (RTT) delay of handshaking.
2.  **Simple:** No connection state needs to be maintained at the sender or receiver.
3.  **Small header size:** Reduces overhead.
4.  **No congestion control:** UDP can blast data as fast as desired and function even when network service is compromised by congestion.

**Common Uses:** Streaming multimedia (which is loss-tolerant but rate-sensitive), DNS, SNMP, and HTTP/3. If an application needs reliability over UDP (like HTTP/3), it must build that reliability and congestion control directly into the application layer.

### The UDP Checksum
UDP includes a simple checksum to detect errors (flipped bits) in the transmitted segment.
*   **Sender:** Treats the segment contents (including header and IP addresses) as a sequence of 16-bit integers, adds them using one's complement sum, and puts the value in the checksum field.
*   **Receiver:** Computes the checksum of the received segment and compares it to the checksum field. If they don't match, an error is detected. 
*   *Weakness:* The checksum is a weak protection. If multiple bits flip in a way that offsets each other during addition, the error will go undetected.

---

## 4. Principles of Reliable Data Transfer (RDT)
Building a reliable data transfer protocol is complex because the underlying channel (IP) is unreliable (it can lose, corrupt, or reorder data). The sender and receiver do not naturally know the "state" of each other (e.g., "Did the receiver get my message?").

We use Finite State Machines (FSMs) to model these protocols incrementally.

### RDT 1.0: Perfectly Reliable Channel
If the underlying channel never flips bits and never loses packets, the protocol is trivial. The sender simply sends the data, and the receiver reads it. 

### RDT 2.0: Channel with Bit Errors
If the channel can flip bits (detected by a checksum), we need a way to recover. RDT 2.0 uses a **stop-and-wait** approach: the sender sends one packet and waits for a response.
*   **Acknowledgements (ACKs):** Receiver tells the sender the packet was received OK.
*   **Negative Acknowledgements (NAKs):** Receiver tells the sender the packet had errors. The sender then retransmits the packet.
*   **The Fatal Flaw:** What if the ACK or NAK itself is corrupted? The sender won't know what happened at the receiver. It can't just blindly retransmit, because the receiver wouldn't know if the incoming packet is a duplicate or new data.

### RDT 2.1: Handling Garbled ACKs/NAKs
To solve the duplicate problem, the sender adds a **sequence number** to each packet. Because we are using a stop-and-wait protocol, we only need two sequence numbers (0 and 1).
*   **Sender FSM:** Has twice as many states as 2.0 because it must "remember" whether the next expected packet should have a sequence number of 0 or 1. If it receives a corrupted ACK/NAK, it retransmits the current packet.
*   **Receiver FSM:** Must check if the received packet is a duplicate. Its state indicates whether 0 or 1 is the expected sequence number.

### RDT 2.2: A NAK-Free Protocol
RDT 2.2 provides the same functionality as 2.1 but removes NAKs. 
*   Instead of sending a NAK, the receiver simply sends an **ACK for the last packet received OK**. 
*   Crucially, the receiver must explicitly include the sequence number of the packet being ACKed. 
*   If the sender receives a **duplicate ACK**, it takes the same action as receiving a NAK: it retransmits the current packet. *(TCP uses this exact NAK-free approach!)*

### RDT 3.0: Channels with Errors and Loss
Now we assume the underlying channel can flip bits *and* lose packets completely. ACKs and sequence numbers aren't enough if the packet never arrives in the first place.
*   **The Timeout Mechanism:** The sender waits a "reasonable amount of time" for an ACK. If no ACK is received before the countdown timer expires, the sender assumes the packet (or its ACK) was lost and retransmits the packet.
*   **Handling Delays:** If the packet or ACK was just delayed (not actually lost), the retransmission will result in a duplicate packet arriving at the receiver. However, the sequence numbers from RDT 2.1 already handle this perfectly, allowing the receiver to identify and discard the duplicate.

**The Performance Problem of Stop-and-Wait (RDT 3.0)**
While RDT 3.0 works, its performance is terrible. Let's look at the sender's utilization ($U_{sender}$), which is the fraction of time the sender is actually busy sending data.
*   **Example:** On a 1 Gbps link with a 15 ms propagation delay ($RTT \approx 30$ ms) and an 8000-bit packet, the transmission time ($L/R$) is only 8 microseconds (0.008 ms).
*   **Calculation:** $U_{sender} = \frac{L/R}{RTT + L/R} = \frac{0.008}{30.008} = 0.00027$.
*   **Conclusion:** The sender is only busy 0.027% of the time! The protocol itself is limiting the performance of the underlying physical infrastructure.

---

## 5. Pipelined Protocols: Go-Back-N (GBN)

To fix the performance issues of stop-and-wait, we use **pipelining**: allowing the sender to have multiple "in-flight," yet-to-be-acknowledged packets at the same time. 
*   Pipelining requires increasing the range of sequence numbers and adding buffering at the sender, receiver, or both. 
*   If we allow 3 in-flight packets, we increase utilization by a factor of 3 ($U_{sender} = \frac{3 \times L/R}{RTT + L/R}$).

One of the most common pipelined protocols is **Go-Back-N (GBN)**.

### Go-Back-N: The Sender
*   **The Window:** The sender is allowed to transmit multiple packets without waiting for an ACK, but is restricted to a maximum "window" of $N$ consecutive unacknowledged packets.
*   **Cumulative ACKs:** The sender relies on cumulative ACKs. If it receives $ACK(n)$, it means all packets up to and including sequence number $n$ have been successfully received. The sender then slides its window forward to begin at $n+1$.
*   **The Timer:** The sender maintains a single timer for the *oldest* in-flight packet.
*   **Timeout Behavior:** If a timeout occurs for packet $n$, the sender retransmits packet $n$ *and all higher sequence number packets* currently in the window.

### Go-Back-N: The Receiver
*   **ACK-Only:** The receiver always sends an ACK for the highest in-order packet it has received correctly so far. This means it may send duplicate ACKs.
*   **Handling Out-of-Order Packets:** If the receiver gets an out-of-order packet (e.g., it was expecting packet 2 but receives packet 3), it will discard the out-of-order packet (or buffer it, depending on implementation) and simply re-send an ACK for the last in-order packet (e.g., $ACK(1)$). It only needs to remember `rcv_base`, the next expected in-order sequence number.

> **GBN in Action:**
> 1.  Sender sends packets 0, 1, 2, 3. 
> 2.  Packet 2 is lost.
> 3.  Receiver gets 0 and 1, sending $ACK(0)$ and $ACK(1)$.
> 4.  Receiver gets 3. Because it was expecting 2, it discards 3 and re-sends $ACK(1)$.
> 5.  Sender receives the duplicate ACKs but ignores them.
> 6.  Eventually, the timer for packet 2 expires. 
> 7.  The sender "goes back N" and retransmits packet 2 *and* packet 3.

---

## 6. TCP: Connection Management, Reliability, and Flow Control

TCP is the workhorse of the Internet. It provides a suite of services that UDP simply ignores:

*   **Point-to-Point:** A TCP connection is strictly between one sender and one receiver.
*   **Reliable, In-Order Byte Stream:** TCP guarantees that data arrives exactly as it was sent. Unlike UDP, which sends discrete "messages," TCP views data as an unstructured stream of bytes without "message boundaries".
*   **Full Duplex Data:** Data can flow in both directions simultaneously within the same connection.
*   **Maximum Segment Size (MSS):** The maximum amount of payload data that can be put into a single TCP segment.
*   **Cumulative ACKs:** TCP uses cumulative acknowledgements, meaning an ACK for sequence number *N* confirms receipt of all bytes up to *N-1*.
*   **Pipelining:** TCP allows multiple "in-flight" unacknowledged packets to increase network utilization. The window size is dynamically set by flow and congestion control mechanisms.
*   **Connection-Oriented:** Before any data is exchanged, the sender and receiver must undergo a handshaking process (exchanging control messages) to initialize their connection state.
*   **Flow Controlled:** TCP ensures that a fast sender will not overwhelm a slow receiver's buffer.

### The TCP Segment Structure
A standard TCP header is typically 20 bytes long and contains several critical fields:

1.  **Source Port & Destination Port (16 bits each):** Used for multiplexing and demultiplexing data to the correct application processes.
2.  **Sequence Number (32 bits):** In TCP, the sequence number is **not** a packet count. It represents the byte-stream "number" of the *first byte* of data in that specific segment.
3.  **Acknowledgement Number (32 bits):** The sequence number of the *next byte* the receiver is expecting from the other side. 
4.  **Header Length:** Indicates where the data begins.
5.  **Flags:** Several 1-bit flags dictate the segment's purpose:
    *   **A (ACK):** Indicates that the Acknowledgement Number field is valid.
    *   **RST, SYN, FIN:** Used for connection management (setup and teardown).
    *   **C, E:** Used for Explicit Congestion Notification.
6.  **Receive Window:** Used for flow control, indicating the number of bytes the receiver is currently willing to accept.
7.  **Internet Checksum:** For detecting bit errors.

> **Out-of-Order Segments:** What does a TCP receiver do if it receives segment 3 before segment 2? The official TCP specification actually doesn't strictly dictate this; it is left up to the implementor (usually the OS developer) whether to buffer the out-of-order segment or discard it. 

### TCP Connection Management (The 3-Way Handshake)
Before any data is exchanged, the sender and receiver must "handshake" to agree to establish the connection and synchronize connection parameters (like starting sequence numbers). 

To prevent issues with delayed or reordered packets establishing "half-open" connections, TCP uses a **3-way handshake**:
1.  **SYN:** The client chooses an initial sequence number `x` and sends a TCP SYN message to the server (Client enters `SYNSENT` state).
2.  **SYNACK:** The server receives the request, chooses its own initial sequence number `y`, and sends a SYNACK message acknowledging `x` (`ACKnum = x+1`) (Server enters `SYN RCVD` state).
3.  **ACK:** The client receives the SYNACK (proving the server is live), enters the `ESTAB` (established) state, and sends an ACK for `y` (`ACKnum = y+1`). This third segment may also contain the first pieces of client-to-server data.

To close a connection, the client and server each close their respective side by sending a TCP segment with the `FIN` bit set to 1, which the other side acknowledges.

### Estimating Round Trip Time (RTT) and Timeouts
TCP uses a countdown timer to determine if a packet was lost and needs retransmission. The timeout value must be dynamically adjusted based on network conditions:

*   TCP estimates the RTT by measuring `SampleRTT`—the actual time elapsed between transmitting a segment and receiving its ACK. 
*   It uses an **Exponential Weighted Moving Average (EWMA)** to smooth the estimate:
    $$EstimatedRTT = (1 - \alpha) \times EstimatedRTT + \alpha \times SampleRTT$$
*   It calculates the deviation (`DevRTT`) of the samples using another EWMA:
    $$DevRTT = (1 - \beta) \times DevRTT + \beta \times |SampleRTT - EstimatedRTT|$$
*   Finally, the timeout interval is calculated as the estimate plus a safety margin:
    $$TimeoutInterval = EstimatedRTT + 4 \times DevRTT$$

### TCP Sender Logic and Retransmissions
To provide reliable data transfer, the simplified TCP sender reacts to three main events:
1.  **Data received from application:** The sender creates a segment with a sequence number and passes it to IP. It starts a timer if one isn't already running.
2.  **Timeout:** If the timer expires, the sender retransmits the specific not-yet-acknowledged segment that caused the timeout and restarts the timer.
3.  **ACK received:** If the ACK acknowledges previously unacknowledged segments, the sender updates its records. It starts the timer if there are still unacknowledged segments, or stops it if there are none.

**TCP Fast Retransmit**
Waiting for a timeout can take a long time, degrading performance. TCP includes a mechanism called **Fast Retransmit** to speed this up.
*   If a sender receives 3 *additional* ACKs for the exact same data ("triple duplicate ACKs"), it assumes that the unacknowledged segment with the smallest sequence number was lost.
*   It immediately resends that segment without waiting for the timeout to occur.

### TCP Flow Control
TCP uses **flow control** to ensure the sender won't overflow the receiver's buffers by transmitting too much data too fast.
*   The TCP receiver "advertises" its available free buffer space using the **`rwnd` (receive window)** field in the TCP header.
*   The `RcvBuffer` size is set via socket options and is often auto-adjusted by the operating system.
*   The sender restricts its amount of unacknowledged ("in-flight") data to stay within the limits of the advertised `rwnd` value, guaranteeing the receive buffer will not overflow.

---

## 7. Principles of Congestion Control

**Congestion** occurs when there are too many sources sending too much data too fast for the network to handle. This is distinctly different from flow control (which only deals with one sender overwhelming one receiver).

### The Costs of Congestion
*   **Infinite Buffers:** As the arrival rate approaches the link's maximum capacity, queueing delays become extremely large.
*   **Finite Buffers & Retransmissions:** When buffers fill up, packets are dropped and must be retransmitted. Premature timeouts can cause senders to transmit unneeded duplicates. This wastes link capacity, meaning the link carries multiple copies of the same packet, decreasing the maximum achievable effective throughput.
*   **Multi-hop Paths:** When a packet is successfully transmitted through several routers but is ultimately dropped at a downstream bottleneck link, all the upstream transmission capacity and buffering used for that packet was entirely wasted.

### Approaches to Congestion Control
1.  **End-end congestion control:** The network provides no explicit feedback. The endpoints must infer congestion based on observed packet loss and delays. *(This is the approach taken by TCP).*
2.  **Network-assisted congestion control:** Routers provide direct, explicit feedback to the sending/receiving hosts. For example, Explicit Congestion Notification (ECN) uses two bits in the IP header to mark congestion, which the destination then echoes back to the sender via the TCP ACK segment.

---

## 8. TCP Congestion Control

To combat congestion, TCP uses an approach called **AIMD (Additive Increase, Multiplicative Decrease)**. The core idea is that a sender will slowly increase its sending rate to probe for available bandwidth until a packet loss (congestion event) occurs, at which point it drastically reduces its rate.

*   **Additive Increase:** The sender increases its sending rate by 1 Maximum Segment Size (MSS) every Round Trip Time (RTT) as long as no loss is detected.
*   **Multiplicative Decrease:** When a loss event occurs, the sender immediately cuts its sending rate in half.

This dynamic probing mechanism results in the classic **"sawtooth"** behavior of a TCP connection's throughput over time. 

### Slow Start
When a connection begins, AIMD's linear increase would take too long to reach a respectable speed. Therefore, TCP begins in **Slow Start**:
*   The initial congestion window (`cwnd`) is set to 1 MSS.
*   The `cwnd` is doubled every RTT (by incrementing `cwnd` for every ACK received). 
*   This means the initial rate starts slow but ramps up exponentially fast.

### Transitioning to Congestion Avoidance
When does the exponential increase (Slow Start) switch to the linear increase (AIMD)? 
*   TCP maintains a variable called `ssthresh` (Slow Start Threshold).
*   On a loss event, `ssthresh` is set to half of `cwnd` just before the loss event. 
*   During Slow Start, once `cwnd` reaches or exceeds `ssthresh`, TCP transitions into **Congestion Avoidance** mode, where it grows linearly.

### TCP CUBIC and Delay-based Congestion Control
As networks evolved to support "long, fat pipes" (high bandwidth, high delay links), classic AIMD struggled to maintain high throughput. 
*   **TCP CUBIC:** A more modern approach (default in Linux) that changes the way it probes for bandwidth. After cutting the rate in half, it rapidly ramps the window size back up close to the previous maximum ($W_{max}$), but then slows down and becomes very cautious as it nears $W_{max}$. It does this using a cubic function of time. 
*   **Delay-based TCP (e.g., BBR):** Tries to keep the sender-to-receiver pipe "just full enough, but no fuller" by monitoring the RTT. If the measured throughput is close to the uncongested throughput, it increases the window; if it falls far below (indicating buffering and congestion), it decreases the window, attempting to avoid congestion *without* forcing a packet loss.

### TCP Fairness
If $K$ TCP sessions share the same bottleneck link of bandwidth $R$, each should ideally get an average rate of $R/K$. TCP is generally fair under idealized assumptions (same RTT, fixed number of sessions in congestion avoidance). However, fairness can be circumvented:
*   **UDP:** Multimedia apps often use UDP specifically to avoid being throttled by TCP's congestion control. There is no "Internet police" enforcing congestion control.
*   **Parallel Connections:** An application (like a web browser) can open multiple parallel connections between two hosts. If a link has 9 existing connections, a new application opening 1 connection gets $1/10$th of the bandwidth, but an application opening 11 connections grabs over half the bandwidth.