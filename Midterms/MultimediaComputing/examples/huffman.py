import math
import sys
from collections import Counter


class Node:
    def __init__(self, weight, symbol=None, left=None, right=None):
        self.weight = weight
        self.symbol = symbol
        self.left = left
        self.right = right


def build_tree(freq):
    # Algorithm 7.1 (L4 p.27): keep the list sorted largest first, so the two smallest are always at the end
    nodes = [Node(w, s) for s, w in sorted(freq.items(), key=lambda kv: -kv[1])]
    while len(nodes) > 1:
        a, b = nodes[-2], nodes[-1]
        left, right = (b, a) if b.weight < a.weight else (a, b)
        parent = Node(a.weight + b.weight, left=left, right=right)
        nodes = nodes[:-2]
        i = 0
        # A new node goes after equal weights, so it is merged first on a tie, as on slide 28
        while i < len(nodes) and nodes[i].weight >= parent.weight:
            i += 1
        nodes.insert(i, parent)
    return nodes[0]


def make_codes(node, prefix="", codes=None):
    if codes is None:
        codes = {}
    if node.symbol is not None:
        codes[node.symbol] = prefix or "0"
    else:
        make_codes(node.left, prefix + "0", codes)
        make_codes(node.right, prefix + "1", codes)
    return codes


def encode(text, codes):
    return "".join(codes[ch] for ch in text)


def decode(bits, root):
    out, node = [], root
    for bit in bits:
        node = node.left if bit == "0" else node.right
        # Prefix property: reaching a leaf means the codeword is complete, no separator needed
        if node.symbol is not None:
            out.append(node.symbol)
            node = root
    return "".join(out)


def main(text):
    freq = Counter(text)
    root = build_tree(freq)
    codes = make_codes(root)
    bits = encode(text, codes)

    print(f"Text: {text!r}\n")
    print("Symbol  Count  Code")
    for sym, count in sorted(freq.items(), key=lambda kv: (len(codes[kv[0]]), -kv[1])):
        print(f"{sym!r:<7} {count:<6} {codes[sym]}")

    utf8_bits = len(text.encode("utf-8")) * 8
    fixed_bits = len(text) * max(1, math.ceil(math.log2(len(freq))))
    n = len(text)
    entropy = sum(c / n * math.log2(n / c) for c in freq.values())

    print(f"\nEncoded bits:   {bits}")
    print(f"Decoded back:   {decode(bits, root)!r}\n")
    print(f"UTF-8:          {utf8_bits} bits")
    print(f"Fixed-length:   {fixed_bits} bits")
    print(f"Huffman:        {len(bits)} bits  (ratio {utf8_bits / len(bits):.2f} vs UTF-8)")
    print(f"Entropy bound:  {entropy * n:.2f} bits  ({entropy:.3f} bits/symbol)")


if __name__ == "__main__":
    main(sys.argv[1] if len(sys.argv) > 1 else "HELLO")
