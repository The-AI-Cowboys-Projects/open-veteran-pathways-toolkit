#!/usr/bin/env python3
"""Threaded static server for local checks. Serves the current directory."""
import argparse
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--port", type=int, default=8765)
    parser.add_argument("--bind", default="127.0.0.1")
    args = parser.parse_args()
    server = ThreadingHTTPServer((args.bind, args.port), SimpleHTTPRequestHandler)
    server.serve_forever()


if __name__ == "__main__":
    main()
