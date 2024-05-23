export const UNIT_TESTS = {
    "liftoff": {
        "unitTests": [
            {
                "dialogue": [
                    {
                        "input": "",
                        "type": "print",
                        "order": 1,
                        "output": "10"
                    },
                    {
                        "input": "",
                        "type": "print",
                        "order": 2,
                        "output": "9"
                    },
                    {
                        "input": "",
                        "type": "print",
                        "order": 3,
                        "output": "8"
                    },
                    {
                        "input": "",
                        "type": "print",
                        "order": 4,
                        "output": "7"
                    },
                    {
                        "input": "",
                        "type": "print",
                        "order": 5,
                        "output": "6"
                    },
                    {
                        "input": "",
                        "type": "print",
                        "order": 6,
                        "output": "5"
                    },
                    {
                        "input": "",
                        "type": "print",
                        "order": 7,
                        "output": "4"
                    },
                    {
                        "input": "",
                        "type": "print",
                        "order": 8,
                        "output": "3"
                    },
                    {
                        "input": "",
                        "type": "print",
                        "order": 9,
                        "output": "2"
                    },
                    {
                        "input": "",
                        "type": "print",
                        "order": 10,
                        "output": "1"
                    },
                    {
                        "input": "",
                        "type": "print",
                        "order": 11,
                        "output": "Liftoff!"
                    }
                ],
                "description": "",
                "key": 1683551904051,
                "pre": [],
                "post": [
                    "10",
                    "9",
                    "8",
                    "7",
                    "6",
                    "5",
                    "4",
                    "3",
                    "2",
                    "1",
                    "Liftoff!"
                ],
                "name": "Liftoff"
            }
        ]
    },
    "multiply2nums": {
        "unitTests": [
            {
                "dialogue": [
                    {
                        "input": "",
                        "type": "print",
                        "order": 4,
                        "output": "This program multiplies two numbers."
                    },
                    {
                        "input": "20",
                        "type": "input",
                        "order": 5,
                        "output": "Enter first number: "
                    },
                    {
                        "input": "3",
                        "type": "input",
                        "order": 7,
                        "output": "Enter second number:"
                    },
                    {
                        "input": "",
                        "type": "print",
                        "order": 8,
                        "output": "60"
                    }
                ],
                "description": "",
                "key": 1683551394131,
                "pre": [
                    "20",
                    "3"
                ],
                "post": [
                    "This program multiplies two numbers.",
                    "Enter first number: ",
                    "Enter second number:",
                    "60"
                ],
                "name": "20x3"
            },
            {
                "dialogue": [
                    {
                        "input": "",
                        "type": "print",
                        "order": 1,
                        "output": "This program multiplies two numbers."
                    },
                    {
                        "input": "5",
                        "type": "input",
                        "order": 2,
                        "output": "Enter first number: "
                    },
                    {
                        "input": "2",
                        "type": "input",
                        "order": 3,
                        "output": "Enter second number:"
                    },
                    {
                        "input": "",
                        "type": "print",
                        "order": 4,
                        "output": "10"
                    }
                ],
                "description": "",
                "key": 1683559022606,
                "pre": [
                    "5",
                    "2"
                ],
                "post": [
                    "This program multiplies two numbers.",
                    "Enter first number: ",
                    "Enter second number:",
                    "10"
                ],
                "name": "5x2"
            }
        ]
    },
    "doubleit": {
        "unitTests": [
            {
                "dialogue": [
                    {
                        "input": "10",
                        "type": "input",
                        "order": 1,
                        "output": "Enter a number:"
                    },
                    {
                        "input": "",
                        "type": "print",
                        "order": 2,
                        "output": "20"
                    },
                    {
                        "input": "",
                        "type": "print",
                        "order": 3,
                        "output": "40"
                    },
                    {
                        "input": "",
                        "type": "print",
                        "order": 4,
                        "output": "80"
                    },
                    {
                        "input": "",
                        "type": "print",
                        "order": 5,
                        "output": "160"
                    }
                ],
                "description": "",
                "key": 1683548565103,
                "pre": [
                    "10"
                ],
                "post": [
                    "Enter a number:",
                    "20",
                    "40",
                    "80",
                    "160"
                ],
                "name": "Start from 10"
            },
            {
                "dialogue": [
                    {
                        "input": "2",
                        "type": "input",
                        "order": 1,
                        "output": "Enter a number:"
                    },
                    {
                        "input": "",
                        "type": "print",
                        "order": 3,
                        "output": "4"
                    },
                    {
                        "input": "",
                        "type": "print",
                        "order": 4,
                        "output": "8"
                    },
                    {
                        "input": "",
                        "type": "print",
                        "order": 5,
                        "output": "16"
                    },
                    {
                        "input": "",
                        "type": "print",
                        "order": 6,
                        "output": "32"
                    },
                    {
                        "input": "",
                        "type": "print",
                        "order": 7,
                        "output": "64"
                    },
                    {
                        "input": "",
                        "type": "print",
                        "order": 8,
                        "output": "128"
                    }
                ],
                "description": "",
                "key": 1683548757114,
                "pre": [
                    "2"
                ],
                "post": [
                    "Enter a number:",
                    "4",
                    "8",
                    "16",
                    "32",
                    "64",
                    "128"
                ],
                "name": "Start from 2"
            }
        ]
    },
    "stonemason": {
        "unitTests": [
            {
                "key": 1682290793359,
                "pre": {
                    "nRows": 9,
                    "karelRow": 8,
                    "walls": {
                        "2,1,East": true,
                        "4,4,North": true,
                        "4,8,North": true,
                        "3,3,North": true,
                        "4,12,North": true,
                        "2,6,East": true,
                        "3,1,North": true,
                        "3,4,East": true,
                        "3,8,East": true,
                        "3,3,East": true,
                        "2,10,North": true,
                        "2,5,East": true,
                        "3,11,North": true,
                        "3,7,North": true,
                        "4,0,North": true,
                        "3,9,North": true,
                        "3,0,East": true,
                        "2,10,East": true,
                        "3,11,East": true,
                        "3,5,North": true,
                        "2,2,East": true,
                        "2,6,North": true,
                        "2,2,North": true,
                        "3,7,East": true,
                        "2,9,East": true
                    },
                    "karelCol": 0,
                    "karelDir": "East",
                    "nCols": 13
                },
                "post": {
                    "nRows": 9,
                    "nCols": 13,
                    "karelCol": 12,
                    "karelRow": 8,
                    "walls": {
                        "2,1,East": true,
                        "4,4,North": true,
                        "4,8,North": true,
                        "3,3,North": true,
                        "4,12,North": true,
                        "2,6,East": true,
                        "3,1,North": true,
                        "3,4,East": true,
                        "3,8,East": true,
                        "3,3,East": true,
                        "2,10,North": true,
                        "2,5,East": true,
                        "3,11,North": true,
                        "3,7,North": true,
                        "4,0,North": true,
                        "3,9,North": true,
                        "3,0,East": true,
                        "2,10,East": true,
                        "3,11,East": true,
                        "3,5,North": true,
                        "2,2,East": true,
                        "2,6,North": true,
                        "2,2,North": true,
                        "3,7,East": true,
                        "2,9,East": true
                    },
                    "beepers": {
                        "7,8": 1,
                        "5,12": 1,
                        "4,8": 1,
                        "5,8": 1,
                        "7,0": 1,
                        "6,0": 1,
                        "5,0": 1,
                        "6,12": 1,
                        "6,4": 1,
                        "7,12": 1,
                        "6,8": 1,
                        "4,12": 1,
                        "8,4": 1,
                        "8,12": 1,
                        "8,8": 1,
                        "8,0": 1,
                        "4,4": 1,
                        "5,4": 1,
                        "7,4": 1,
                        "4,0": 1
                    },
                    "karelDir": "East"
                },
                "name": "Efes"
            }
        ]
    },
    "fillkarel": {
        "unitTests": [
            {
                "key": 1682704186556,
                "pre": {
                    "nRows": 5,
                    "karelRow": 4,
                    "walls": {
                        "4,4,North": true,
                        "2,4,North": true,
                        "2,1,North": true,
                        "4,3,North": true,
                        "4,1,North": true,
                        "1,2,North": true,
                        "2,3,North": true,
                        "3,3,North": true,
                        "3,4,North": true,
                        "3,1,North": true,
                        "1,3,North": true,
                        "3,2,North": true,
                        "2,2,North": true,
                        "1,4,North": true,
                        "1,1,North": true,
                        "4,2,North": true
                    },
                    "karelCol": 0,
                    "karelDir": "East",
                    "nCols": 5
                },
                "post": {
                    "nRows": 5,
                    "nCols": 5,
                    "karelCol": 4,
                    "karelRow": 0,
                    "walls": {
                        "4,4,North": true,
                        "2,4,North": true,
                        "2,1,North": true,
                        "4,3,North": true,
                        "4,1,North": true,
                        "1,2,North": true,
                        "2,3,North": true,
                        "3,3,North": true,
                        "3,4,North": true,
                        "3,1,North": true,
                        "1,3,North": true,
                        "3,2,North": true,
                        "2,2,North": true,
                        "1,4,North": true,
                        "1,1,North": true,
                        "4,2,North": true
                    },
                    "beepers": {
                        "4,3": 1,
                        "1,4": 1,
                        "3,1": 1,
                        "0,2": 1,
                        "4,2": 1,
                        "1,0": 1,
                        "3,0": 1,
                        "2,0": 1,
                        "4,1": 1,
                        "3,4": 1,
                        "2,1": 1,
                        "1,3": 1,
                        "3,2": 1,
                        "2,4": 1,
                        "0,1": 1,
                        "2,3": 1,
                        "1,1": 1,
                        "4,4": 1,
                        "3,3": 1,
                        "1,2": 1,
                        "2,2": 1,
                        "0,4": 1,
                        "0,0": 1,
                        "0,3": 1,
                        "4,0": 1
                    },
                    "karelDir": "East"
                },
                "name": "5x5"
            },
            {
                "key": 1682704156395,
                "pre": {
                    "nRows": 3,
                    "karelRow": 2,
                    "walls": {
                        "2,3,North": true,
                        "2,2,North": true,
                        "1,1,North": true,
                        "2,1,North": true,
                        "1,3,North": true,
                        "1,2,North": true
                    },
                    "karelCol": 0,
                    "karelDir": "East",
                    "nCols": 4
                },
                "post": {
                    "nRows": 3,
                    "nCols": 4,
                    "karelCol": 3,
                    "karelRow": 0,
                    "walls": {
                        "2,3,North": true,
                        "2,2,North": true,
                        "1,1,North": true,
                        "2,1,North": true,
                        "1,3,North": true,
                        "1,2,North": true
                    },
                    "beepers": {
                        "0,0": 1,
                        "0,1": 1,
                        "2,3": 1,
                        "1,1": 1,
                        "1,3": 1,
                        "1,0": 1,
                        "2,0": 1,
                        "1,2": 1,
                        "2,2": 1,
                        "0,2": 1,
                        "0,3": 1,
                        "2,1": 1
                    },
                    "karelDir": "East"
                },
                "name": "3x4"
            },
            {
                "key": 1682704270303,
                "pre": {
                    "nRows": 2,
                    "nCols": 2,
                    "karelCol": 0,
                    "karelRow": 1,
                    "walls": {
                        "1,1,North": true
                    },
                    "beepers": {
                        "0,1": 0,
                        "1,1": 0,
                        "0,0": 0,
                        "1,0": 0
                    },
                    "karelDir": "East"
                },
                "post": {
                    "nRows": 2,
                    "nCols": 2,
                    "karelCol": 1,
                    "karelRow": 0,
                    "walls": {
                        "1,1,North": true
                    },
                    "beepers": {
                        "0,1": 1,
                        "1,1": 1,
                        "0,0": 1,
                        "1,0": 1
                    },
                    "karelDir": "East"
                },
                "name": "2x2"
            }
        ]
    }
}