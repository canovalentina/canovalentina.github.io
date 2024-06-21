README- Code sent upon request

Project: Autocorrect
Student: vcano

____ ____ ____ ____ ____ ____ ____ ____ ____ ____ ____ 
||A |||u |||t |||o |||c |||o |||r |||r |||e |||c |||t ||
||__|||__|||__|||__|||__|||__|||__|||__|||__|||__|||__||
|/__\|/__\|/__\|/__\|/__\|/__\|/__\|/__\|/__\|/__\|/__\|


PROJECT DESCRIPTION:

Implementation of an autocorrection program that provides suggestions given an incomplete or incorrect input word, similar to what Google does with its search. The initial dictionary will be filled using a text file we choose. The program will be checking for and correcting typos in the typed text as well. Create two user interfaces for this project: one through the terminal, the other through a GUI front end using Spark. This is simple if you implement the project properly. Generate suggestions with a “trie” like data structure (typically pronounced “try”). Tries are a specific type of tree and are frequently used to represent a dictionary of words. Each node is associated with a letter and a set of child nodes representing potential suffixes to this node. Program  operates in two phases. First, during suggestion generation, it uses various rules to generate suggestions for the most recently typed word, without regard to whether they are “good” suggestions. Next, suggestions are ranked so that more likely suggestions are presented first.

	-SUGGESTIONS: Levensthein Edit distance, prefix matching and whitespace testing; 

	-RANKINGS: exact match, unigram ranking, bigram ranking, alphabetical order

	-GUI SPECIFICATION: Field for typing input. As the user is typing (as every character is typed or deleted), the program gets and displays the top five suggestions. Runs fast enough to provide input that feels “instant” while typing, using JavaScript.


1-) Design details specific to your code: 
	
	1.a-) Packages: My code is organized in the following packages: 
		-autocorrect: Contains all of the classes that tie together the functionality of the program
		-autocorrect.ranker: Contains classes related the to the rankers
		-autocorrect.suggestion: Contains classes related the to the suggestibles, and the wrapper suggestion class
		-helper: contains two wrapper classes that will serve to create a string out of two strings, and the frequency map (in seprate package just in case I want to reuse them for the future)
		-reader: contains fileReader and fileChecker, which abstracts the code of checking whether a file is valid
		-trie: implementation of Trie Dataa Structure

	1-b) Trie: 
		-Recursive Trie implementation, which uses an inner TrieNode class. 
		-Stores the root node in a field so that it can recursively call methods on the Trie
		-The inner Node class is static to provide access of fields. It represents whether there is a word at that point with the boolean isWordEnd, and the children node, as a Hasmpaf of Characters to Nodes.

	1-c) Interfaces: 

		-Suggestible interface: creates an abstraction of every type of "suggestor". The benefit to doing so is that then the Autocorrect class can call generically on suggestWords from anything of type Suggestible. This permits extensibility in the case that another type of suggestors wants to be added to the program. In the case of my Autocorrect, each class which implements the Suggestible interface will suggestWords based on the Trie constructed in the Input class.
		-Ranker interface: to make the Rankers more generic. Since my Autocorrect class passes in anything of type Ranker, I can simply add another Ranker that implements the Ranker interface to the Autocorrect class. 
			*Note: I understand that it is not very extensible to have to pass in the previous word and BigramMap to my rankers and make the comparisons, but the way I emplemented it made it hard to change my desuign. In the future, I will try to think even more about design, before starting to implement.

	1-d) Initializer and Input classes: To make the code a bit cleaner, I made an Initializer class which takes care of the command line and gui. Similarly, the Input class serves to abstract the functionality of taking in the files and constructing the Trie and ProbabilityMaps.

	1-e) Wrapper classes:
		-Created the helper ProbabilityMap class to be able to contain the specific functionality relative to mapping a String to its frequency (represented by an Integer.)
		-The Suggestion class stores information necessary to calculate the ranking of the suggestions
		-BigramString provides a convenient way to make a string out of two, given that I saw that i was using this functionality in more than one of my classes.

2-) Any runtime/space optimizations:
	-The children of the TrieNode are represented as a HashMap for fasterlookup
	-Use of StringBuilders instead of string concetanation (Because java's strings are immutable)

3-) Tests: 
		-jUnit: Made packages that test the different parts of the functionality of the program, organized in the same packages 
		-system tests: test whether the program is performing the desired output from the command line; important tests include the difference between the word hello with the classic ranker and the smart ranker.

4-) How to build/run your program from the command-line: 
	-Run mvn package
	-Make sure to have changed to relative path for the jUnit tests 
	- Call ./run [flags of suggestibles] [optional --smart flag for SmartRanker][optional --gui flag for the frontEnd][name of file(s) for corpus]
		-Suggestibles flags: --led, --prefix, --whitespace
			-Note: pass in maxLedDistance next to the led flag
	-From the command line, to terminate press ctrl-c
		
Point